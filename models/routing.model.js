const db = require("../config/db/connection");
const uuid = require("uuid");
const moment = require("moment-timezone");
class RoutingModel {
    findAll = async (page, limit, userID = null) => {
        let offset = (page - 1) * limit;
        let where = userID != null ? `where r.user_id = '${userID}'` : ``;
        let totalSql = `SELECT count(*) as count FROM routings ${where}`;
        let dataSql = `SELECT r.*, u.name as user_name, u.username as user_username, email as user_email, u.level as user_level 
                        FROM routings r
                        LEFT JOIN users u ON r.user_id = u.id
                        ${where}
                        ORDER BY r.id DESC LIMIT ${limit} OFFSET ${offset}`;
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

    findOne = async (id, userID = null) => {
        if (!id) return null;
        let where = userID != null ? `AND r.user_id = '${userID}'` : ``;
        let sql = `SELECT r.*, u.name as user_name, u.username as user_username, email as user_email, u.level as user_level 
                    FROM routings as r 
                    LEFT JOIN users u ON r.user_id = u.id
                    WHERE r.id = '${id}' ${where}
                    ORDER BY r.created_at ASC 
                    LIMIT 1`;

        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findRoutingDetail = async (routingID, page, limit) => {
        let offset = (page - 1) * limit;
        let totalSql = `SELECT count(*) as count FROM routing_details rd WHERE rd.routing_id = '${routingID}'`;
        let dataSql = `SELECT rd.id, rd.routing_id, rd.providerdetail_id, rd.status, rd.uuid, rd.is_backup,
                        pd.provider_id, pd.license_key, pd.is_active, pd.label, pd.price, pd.expired_at, pd.description, pd.info_hp,
                        p.name as provider_name, p.url as provider_url, p.description as provider_description
                        FROM routing_details rd
                        LEFT JOIN provider_details pd ON pd.id = rd.providerdetail_id
                        JOIN providers p ON p.id = pd.provider_id
                        WHERE rd.routing_id = '${routingID}'
                        ORDER BY rd.updated_at DESC 
                        LIMIT ${limit}
                        OFFSET ${offset}`;
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

    insert = async (data) => {
        const sender_name = data.sender_name;
        const user_id = data.user_id;
        const status = data.status || true;
        const type = data.type;
        const delay = data.delay;
        const price = data.price;
        const price_per_message = data.price_per_message;
        const created_at = moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss.SSS");

        let sql = `INSERT INTO routings (sender_name, user_id, status, type, delay, price, price_per_message, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING *`;
        const result = await db.query(sql, [
            sender_name,
            user_id,
            status,
            type,
            delay,
            price,
            price_per_message,
            created_at,
        ]);

        if (result.rows.length === 0) return null;
        return result.rows[0];
    };

    update = async (sender_name, data) => {
        const updated_at = moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss.SSS");

        let update = "";
        if ("status" in data) update += `status = ${data.status}, `;
        if ("type" in data) update += `type = '${data.type}', `;
        if ("delay" in data) update += `delay = ${data.delay}, `;
        if ("price" in data) update += `price = ${data.price}, `;
        if ("delay_max" in data) update += `delay_max = ${data.delay_max}, `;
        if ("footer_id" in data) update += `footer_id = '${data.footer_id}', `;
        update += `updated_at = $2`;

        let sql = `UPDATE routings SET ${update} WHERE sender_name = $1 RETURNING *`;
        return await db.query(sql, [sender_name, updated_at]);
    };

    delete = async (providerdetail_id, user_id) => {
        let sql = `DELETE FROM routings WHERE providerdetail_id='${providerdetail_id}' AND user_id='${user_id}'`;
        return await db.query(sql);
    };

    getSender = async (userID, senderName, sort = "ASC", isBackup = false) => {
        const status = true;
        const sortManipulate = sort === "DESC" ? "ASC" : "DESC";
        let sql = `SELECT pd.id, pd.provider_id, pd.license_key, pd.is_active, pd.label, pd.uuid, pd.price, pd.expired_at, 
                    pd.handphone_id, rd.id as routingdetail_id, rd.status, rd.created_at, rd.used_at, r.count, r.delay, r.type, r.delay_max
                    FROM routing_details rd
                    INNER JOIN routings r ON rd.routing_id = r.id
                    INNER JOIN provider_details pd ON rd.providerdetail_id = pd.id
                    WHERE r.user_id = $1 AND r.sender_name = $2 AND pd.is_active = $3 AND rd.status = $3 AND rd.is_backup = $4
                    ORDER BY rd.used_at IS NULL ${sortManipulate}, rd.used_at ${sort}, rd.created_at ASC
                    LIMIT 1`;

        const data = await db.query(sql, [
            userID,
            senderName,
            status,
            isBackup,
        ]);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    checkSenderName = async (sender_name) => {
        let sql = `SELECT r.*, f.content FROM routings r LEFT JOIN footers f ON f.id = r.footer_id WHERE sender_name = $1`;
        return await db.query(sql, [sender_name]);
    };

    increment = async (id, note = null, client = null) => {
        let sqlSet = `count = count + 1`;
        if (note === "backup") sqlSet = `backup = backup + 1`;

        const sql = `UPDATE routings SET ${sqlSet} WHERE id = '${id}'`;
        const executor = client || db;
        await executor.query(sql);
        return true;
    };

    decrement = async (id, note = null, client = null) => {
        let sqlSet = `count = count - 1`;
        if (note === "backup") sqlSet = `backup = backup - 1`;

        const sql = `UPDATE routings SET ${sqlSet} WHERE id = '${id}'`;
        const executor = client || db;
        await executor.query(sql);
        return true;
    };
}

module.exports = new RoutingModel();
