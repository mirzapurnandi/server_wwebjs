const db = require("../config/db/connection");
const { addMonths } = require("date-fns");
const uuid = require("uuid");
const moment = require("moment-timezone");

class providerDetailModel {
    findByID = async (id = 1, license_key = null, join = "") => {
        let sql;
        if (license_key == null) {
            sql = `SELECT * FROM provider_details where id = '${id}'`;
        } else {
            if (join === "providers") {
                sql = `SELECT pd.id, pd.user_id, pd.license_key, pd.is_active, pd.label,
                        p.id as provider_id, p.name, p.code, p.method, p.url, p.apikey, p.pwdkey, p.status 
                        FROM provider_details pd
                        LEFT JOIN providers as p ON pd.provider_id = p.id 
                        WHERE pd.license_key = '${license_key}'`;
            } else {
                sql = `SELECT * FROM provider_details where license_key = '${license_key}'`;
            }
        }
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findAll = async (provider_id, page = 1, limit = 20, user_id = null) => {
        let offset = (page - 1) * limit;
        let where = `pd.provider_id = ${provider_id}`;
        if (user_id != null) {
            where = `pd.user_id = '${user_id}'`;
        }

        let total = `SELECT count(pd.id) as count FROM provider_details as pd WHERE ${where}`;
        let sql = `SELECT pd.id, pd.provider_id, pd.user_id, pd.license_key, pd.is_active, pd.label, pd.expired_at, 
                    pd.description, pd.info_hp, pd.created_at, pd.updated_at, p.name, p.code
                    FROM provider_details as pd 
                    left join providers as p ON p.id = pd.provider_id
                    WHERE ${where} 
                    ORDER BY pd.id ASC 
                    LIMIT ${limit} 
                    OFFSET ${offset}`;

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

    insert = async (data, client = null) => {
        const provider_id = data.provider_id;
        const user_id = data.user_id;
        const license_key = data.license_key;
        const price = data.price || 0;
        const is_active = data.is_active || false;
        const label = data.label || "";
        const created_at = moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss.SSS");
        const expired = data.expired || 1;
        const expired_at = addMonths(created_at, expired);

        let Uuid = uuid.v4();
        let uuids = Uuid.split("-").join("P");

        let sql = `INSERT INTO provider_details 
                (provider_id, user_id, license_key, is_active, label, price, uuid, created_at, updated_at, expired_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9) 
                RETURNING *`;

        const executor = client || db;
        return await executor.query(sql, [
            provider_id,
            user_id,
            license_key,
            is_active,
            label,
            price,
            uuids,
            created_at,
            expired_at,
        ]);
    };

    update = async (id, data, ket = "") => {
        const updated_at = moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss.SSS");

        let update = "";
        if ("is_active" in data) update += `is_active = ${data.is_active}, `;
        if ("label" in data) update += `label = '${data.label}', `;
        if ("price" in data) update += `price = ${data.price}, `;
        if ("expired" in data) update += `expired_at = '${data.expired}', `;
        if ("description" in data)
            update += `description = '${data.description}', `;
        if ("info_hp" in data) update += `info_hp = '${data.info_hp}', `;
        if ("handphone_id" in data)
            update += `handphone_id = '${data.handphone_id}', `;
        update += `updated_at = $2`;

        let where = `id = $1`;
        if (ket !== "") where = `license_key = $1`;

        let sql = `UPDATE provider_details SET ${update} WHERE ${where} RETURNING *`;
        return await db.query(sql, [id, updated_at]);
    };

    delete = async (id) => {
        let sql = `DELETE FROM provider_details WHERE id = ${id}`;
        return await db.query(sql);
    };

    checkSenderName = async (sender_name, user_id = "") => {
        let where = `sender_name = $1`;
        let values = [sender_name];
        if (user_id !== "") {
            where += ` and user_id = $2`;
            values = [sender_name, user_id];
        }

        let sql = `SELECT * FROM provider_details WHERE ${where}`;
        return await db.query(sql, values);
    };
}

module.exports = new providerDetailModel();
