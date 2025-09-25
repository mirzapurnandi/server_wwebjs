const db = require("../config/db/connection");

class ProviderModel {
    findOne = async (id, checkReady = false) => {
        if (!id) return null;

        let sql = `SELECT * FROM providers as p WHERE p.id = '${id}' `;
        if (checkReady === true) sql += `AND p.total > p.count `;
        sql += `ORDER BY p.created_at ASC LIMIT 1`;

        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findByUrl = async (url) => {
        if (!url) return null;
        let sql = `SELECT * FROM providers as p WHERE p.url = '${url}' limit 1`;
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findAll = async (page = 1, limit = 10) => {
        let offset = (page - 1) * limit;
        let totalSql = `SELECT count(*) as count FROM providers`;
        let dataSql = `SELECT * FROM providers ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        const [totalData, dataResult] = await Promise.all([
            db.query(totalSql),
            db.query(dataSql),
        ]);

        let dataCount = parseInt(totalData.rows[0].count);
        let last_page = dataCount > limit ? Math.ceil(dataCount / limit) : 1;
        let from = offset + 1;
        let totalTo = offset + limit;
        let to = totalTo >= dataCount ? dataCount : totalTo;
        return {
            total: dataCount,
            current_page: page,
            last_page: last_page,
            per_page: limit,
            from: from,
            to: to,
            data: dataResult.rows,
        };
    };

    /**
     * @typedef {Object} RequestData
     * @property {string} name
     * @property {string} code
     * @property {string} method
     * @property {string} url
     * @property {string} apikey
     * @property {string} pwdkey
     * @property {boolean} is_ssl
     * @property {boolean} code
     * @property {string} description
     */

    /**
     * Mengambil data dari API dengan metode GET
     * @param {RequestData} data - {name: string, code: string, method: string, url: string, apikey: string, pwdkey: string, is_ssl: boolean, status: boolean, description: string }
     */
    insert = async (data) => {
        const name = data.name;
        const code = data.code;
        const method = data.method;
        const url = data.url;
        const apikey = data.apikey;
        const pwdkey = data.pwdkey || "";
        const is_ssl = data.is_ssl || false;
        const status = data.status || true;
        const total = data.total;
        const description = data.description || "";
        const created_at = new Date();

        let sql = `INSERT INTO providers (name, code, method, url, apikey, pwdkey, is_ssl, total, status, description, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`;
        const result = await db.query(sql, [
            name,
            code,
            method,
            url,
            apikey,
            pwdkey,
            is_ssl,
            total,
            status,
            description,
            created_at,
        ]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    };

    update = async (id, datas) => {
        const updatedAt = new Date();

        const provider = await this.findOne(id);
        if (provider) {
            let update = "";
            if ("name" in datas) update += `name = '${datas.name}', `;
            if ("code" in datas) update += `code = '${datas.code}', `;
            if ("method" in datas) update += `method = '${datas.method}', `;
            if ("url" in datas) update += `url = '${datas.url}', `;
            if ("apikey" in datas) update += `apikey = '${datas.apikey}', `;
            if ("pwdkey" in datas) update += `pwdkey = '${datas.pwdkey}', `;
            if ("is_ssl" in datas) update += `is_ssl = ${datas.is_ssl}, `;
            if ("total" in datas) update += `total = ${datas.total}, `;
            if ("status" in datas) update += `status = ${datas.status}, `;
            if ("description" in datas)
                update += `description = '${datas.description}', `;
            update += `updated_at = $2`;

            let sql = `UPDATE providers SET ${update} WHERE id = $1 RETURNING *`;
            const result = await db.query(sql, [id, updatedAt]);

            if (result.rows.length === 0) return null;
            return result.rows[0];
        }

        return null;
    };

    delete = async (id) => {
        const provider = await this.findOne(id);
        if (provider) {
            let sql = `DELETE FROM providers WHERE id = ${id}`;
            return await db.query(sql);
        }
        return null;
    };

    increment = async (id, client = null) => {
        //check data
        const check = await this.findOne(id);
        if (parseInt(check.count) >= parseInt(check.total)) {
            return false;
        }

        let sql = `UPDATE providers SET count = count + 1 WHERE id = '${id}'`;
        const executor = client || db;
        await executor.query(sql);
        return true;
    };

    decrement = async (id) => {
        let sql = `UPDATE providers SET count = count - 1 WHERE id = '${id}'`;
        await db.query(sql);
        return true;
    };
}

module.exports = new ProviderModel();
