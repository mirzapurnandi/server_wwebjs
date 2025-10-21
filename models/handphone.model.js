const db = require("../config/db/connection");
const { addMonths } = require("date-fns");
const uuid = require("uuid");
const moment = require("moment-timezone");

class handphoneModel {
    /* findByID = async (id = 1, license_key = null, join = "") => {
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
    }; */

    findAll = async (datas) => {
        let limit = datas.limit;
        let page = datas.page;
        let offset = (page - 1) * limit;
        let where = `WHERE h.is_active = ${datas.is_active} `;
        if ("is_used" in datas) {
            let crossing =
                datas.is_used == "true" || datas.is_used == true
                    ? "not null"
                    : "null";
            where += `AND pd.handphone_id is ${crossing}`;
        }

        let total = `SELECT count(h.id) as count FROM handphones as h 
                        JOIN handphone_merks hm ON hm.id = h.handphonemerk_id
                        LEFT JOIN provider_details pd ON pd.handphone_id = h.id ${where}`;
        let sql = `SELECT 
                    CASE
                        WHEN pd.handphone_id is null THEN false
                        ELSE true
                    END as used, 
                    hm.base_color,
                    CASE h.type
                        WHEN 'a' THEN hm.color_a
                        WHEN 'b' THEN hm.color_b
                        WHEN 'c' THEN hm.color_c
                        WHEN 'd' THEN hm.color_d
                    END AS color_type,
                    concat(hm.name, ' || ', hm.info) as handphonemerk, 
                    h.id, h."name", h."type", h.is_active, h.is_recovery, h.urutan
                    FROM handphones h
                    JOIN handphone_merks hm ON hm.id = h.handphonemerk_id
                    LEFT JOIN provider_details pd ON pd.handphone_id = h.id
                    ${where}
                    ORDER BY h.handphonemerk_id, h.urutan ASC 
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

    update = async (id, data, ket = "") => {
        const updated_at = moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss.SSS");

        let update = "";
        if ("handphonemerk_id" in data)
            update += `handphonemerk_id = ${data.handphonemerk_id}, `;
        if ("name" in data) update += `name = '${data.name}', `;
        if ("type" in data) update += `type = '${data.type}', `;
        if ("description" in data)
            update += `description = '${data.description}', `;
        if ("is_active" in data) update += `is_active = ${data.is_active}, `;
        if ("is_recovery" in data)
            update += `is_recovery = ${data.is_recovery}, `;
        if ("urutan" in data) update += `urutan = ${data.urutan}, `;
        update += `updated_at = $2`;

        let where = `id = $1`;
        if (ket !== "") where = `license_key = $1`;

        let sql = `UPDATE provider_details SET ${update} WHERE ${where} RETURNING *`;
        return await db.query(sql, [id, updated_at]);
    };

    getFooterByID = async (id) => {
        let sql = `SELECT f.* FROM footers f WHERE f.id = $1`;
        return await db.query(sql, [id]);
    };

    /* delete = async (id) => {
        let sql = `DELETE FROM provider_details WHERE id = ${id}`;
        return await db.query(sql);
    }; */
}

module.exports = new handphoneModel();
