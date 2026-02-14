const db = require("../config/db/connection");

class keywordModel {
    // Mencari keyword utama berdasarkan no_hp dan nama keyword
    getByNameAndPhone = async (name, no_hp) => {
        let sql = `SELECT * FROM keywords WHERE no_hp = $1 AND LOWER(name) = LOWER($2) LIMIT 1`;
        const result = await db.query(sql, [no_hp, name]);
        return result.rows.length > 0 ? result.rows[0] : null;
    };

    // Mengambil semua instruksi/anak berdasarkan parent_id
    getChilds = async (parentId) => {
        let sql = `SELECT * FROM keywords WHERE parent_id = $1 ORDER BY id ASC`;
        const result = await db.query(sql, [parentId]);
        return result.rows;
    };
}

module.exports = new keywordModel();
