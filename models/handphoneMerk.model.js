const db = require("../config/db/connection");

class handphoneMerkModel {
    // Mencari merk berdasarkan nama (case-insensitive)
    getByName = async (name) => {
        let sql = `SELECT * FROM handphone_merks WHERE UPPER(name) = UPPER($1) LIMIT 1`;
        const result = await db.query(sql, [name]);
        return result.rows.length > 0 ? result.rows[0] : null;
    };
}

module.exports = new handphoneMerkModel();
