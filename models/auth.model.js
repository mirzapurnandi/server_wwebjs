const db = require("../config/db/connection");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const moment = require("moment-timezone");
const dateNowWIB = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
class AuthModel {
    findUserToken = async (userId) => {
        if (!userId) return null;
        let sql = `SELECT * FROM user_tokens WHERE user_id='${userId}' order by created_at DESC limit 1`;
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    updateUserToken = async (userId, refreshToken, status = true) => {
        if (!userId || !refreshToken) return null;
        const dateNow = dateNowWIB;
        let sql = `UPDATE user_tokens SET logout = $1, updated_at = $2 WHERE user_id = $3 AND refresh_token= $4 RETURNING *`;
        const data = await db.query(sql, [
            status,
            dateNow,
            userId,
            refreshToken,
        ]);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    create = async (data) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        let Uuid = uuid.v4();
        let id = Uuid.split("-").join("Y");
        const dateNow = dateNowWIB;
        let sql = `INSERT INTO users (id, name, username, email, password, level, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

        const result = await db.query(sql, [
            id,
            data.name,
            data.username,
            data.email,
            hashedPassword,
            data.level,
            dateNow,
        ]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    };

    checkEmail = async (email) => {
        if (!email) return null;
        let sql = `SELECT * FROM users WHERE email='${email}'`;
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    checkUserPrivate = async (userID, passkey, note = null) => {
        if (!userID) return null;
        let select, where, param;
        if (note === "intern") {
            select = `u.id, u.name, u.email, u.level, up.method, up.url`;
            where = `up.user_id = $1`;
            param = [userID];
        } else {
            select = `u.id, u.name, u.email, u.level `;
            where = `up.user_id = $1 and up.passkey = $2`;
            param = [userID, passkey];
        }
        let sql = `SELECT ${select}
                        FROM user_privates up
                        JOIN users u ON u.id = up.user_id 
                        WHERE ${where} order by up.created_at DESC limit 1`;
        const data = await db.query(sql, param);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    checkUsername = async (username) => {
        if (!username) return null;
        let sql = `SELECT * FROM users WHERE username='${username}'`;
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    saveDataToken = async (data) => {
        const dateNow = dateNowWIB;
        let sql = `INSERT INTO user_tokens (user_id, token, refresh_token, created_at) VALUES ($1, $2, $3, $4) RETURNING *`;
        return await db.query(sql, [
            data.user_id,
            data.token,
            data.refresh_token,
            dateNow,
        ]);
    };
}

module.exports = new AuthModel();
