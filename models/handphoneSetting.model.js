const db = require("../config/db/connection");

class handphoneSettingModel {
    // Mencari setting berdasarkan id_instance (license_key)
    getByInstance = async (dataTo) => {
        let sql = `SELECT * FROM handphone_settings WHERE no_hp = $1 AND is_active = $2 LIMIT 1`;
        const result = await db.query(sql, [dataTo, true]);
        return result.rows.length > 0 ? result.rows[0] : null;
    };
}

module.exports = new handphoneSettingModel();
