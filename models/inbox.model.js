const db = require("../config/db/connection");

class InboxModel {
    insert = async (data, licenseKey) => {
        const messageID = data.id_msg;
        const type = data.type;
        const from = data.from;
        const to = data.to;
        const content = data.content;
        const created_at = new Date();

        let sql = `INSERT INTO inboxs (messageid, type, license_key, from_, to_, content, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const result = await db.query(sql, [
            messageID,
            type,
            licenseKey,
            from,
            to,
            content,
            created_at,
        ]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    };
}

module.exports = new InboxModel();
