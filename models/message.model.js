const db = require("../config/db/connection");
class MessageModel {
    findAll = async (page = 1, limit = 10, userID) => {
        let offset = (page - 1) * limit;
        let total = `SELECT count(*) as count FROM message_temps`;
        let sql = `SELECT * FROM message_temps WHERE user_id = '${userID}' ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

        const totalDatas = await db.query(total);
        const totalData = parseInt(totalDatas.rows[0].count);
        const data = await db.query(sql);

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
            result: data.rows,
        };
    };

    insert = async (data) => {
        const userID = data.user_id;
        const destination = data.destination;
        const content = data.content;
        const created_at = new Date();

        let sql = `INSERT INTO message_temps (user_id, destination, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(sql, [
            userID,
            destination,
            content,
            created_at,
        ]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    };

    delete = async (id) => {
        let sql = `DELETE FROM message_temps WHERE id = ${id}`;
        return await db.query(sql);
    };
}

module.exports = new MessageModel();
