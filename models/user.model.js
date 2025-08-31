const db = require("../config/db/connection");

class UserModel {
    find = async (id, email = false) => {
        if (!id) return null;

        let sql = `SELECT id, name, username, email, level, created_at, updated_at FROM users `;
        if (email === true) {
            sql += `where email = '${id}'`;
        } else {
            sql += `where id = '${id}'`;
        }

        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findAll = async (page = 1, limit = 10) => {
        let offset = (page - 1) * limit;
        let sqlTotal = `SELECT count(id) as count FROM users`;
        let sqlData = `SELECT id, name, username, email, level, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        const dataTotal = await db.query(sqlTotal);
        const totalData = parseInt(dataTotal.rows[0].count);
        const showData = await db.query(sqlData);

        const last_page = totalData > limit ? Math.ceil(totalData / limit) : 1;
        const from = offset + 1;
        const totalTo = offset + limit;
        const to = totalTo >= totalData ? totalData : totalTo;
        return {
            total: totalData,
            current_page: parseInt(page),
            last_page: parseInt(last_page),
            per_page: limit,
            from: from,
            to: to,
            data: showData.rows,
        };
    };
}

module.exports = new UserModel();
