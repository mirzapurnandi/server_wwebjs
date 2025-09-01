const db = require("../config/db/connection");
const crypto = require("crypto");
const moment = require("moment-timezone");
const dateNowWIB = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

// generate passkey random (64 hex chars)
function generatePasskey() {
    return crypto.randomBytes(32).toString("hex");
}

class UserPrivateModel {
    /**
     * Insert jika belum ada, update (ganti passkey & count+=1) jika sudah ada
     * @param {string} userId
     * @param {number} initialCount default 1 saat insert
     */
    upsert = async (userId, initialCount = 1) => {
        const passkey = generatePasskey();
        const dateNow = dateNowWIB;
        const sql = `INSERT INTO user_privates (user_id, passkey, count, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $4)
                    ON CONFLICT (user_id)
                    DO UPDATE SET
                        passkey    = EXCLUDED.passkey,
                        count      = user_privates.count + 1,
                        updated_at = $4
                    RETURNING *`;

        const { rows } = await db.query(sql, [
            userId,
            passkey,
            initialCount,
            dateNow,
        ]);
        return rows[0];
    };

    /**
     * Optional: hanya increment count tanpa ganti passkey
     */
    incrementCount = async (userId) => {
        const { rows } = await db.query(
            `UPDATE user_privates SET count = count + 1, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
            [userId]
        );
        return rows[0] || null;
    };

    /**
     * Optional: get by userId
     */
    findByUserId = async (userId) => {
        const { rows } = await db.query(
            `SELECT * FROM user_privates WHERE user_id = $1 LIMIT 1;`,
            [userId]
        );
        return rows[0] || null;
    };
}

module.exports = new UserPrivateModel();
