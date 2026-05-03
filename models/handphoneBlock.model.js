const db = require("../config/db/connection");

class HandphoneBlockModel {
    async insertIfNotExist(handphone) {
        const query = `
            INSERT INTO handphone_blocks (handphone)
            VALUES ($1)
            ON CONFLICT (handphone) DO NOTHING
            RETURNING *;
        `;
        const result = await db.query(query, [handphone]);
        return result.rows[0];
    }

    async check(handphone) {
        const query = `SELECT id FROM handphone_blocks WHERE handphone = $1 LIMIT 1;`;
        const result = await db.query(query, [handphone]);
        return result.rows.length > 0;
    }
}

module.exports = new HandphoneBlockModel();
