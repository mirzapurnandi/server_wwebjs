const db = require("../config/db/connection");
const { createUUID } = require("../utils/helper");
const { toPostgresTimestamp } = require("../helpers/dateHelper");

class TransactionModel {
    constructor() {
        this.table = "transactions";
    }

    findByID = async (id_transaction, userID = null) => {
        const where = userID !== null ? `AND user_id = '${userID}'` : "";
        let sql = `SELECT * FROM ${this.table} as t 
                    WHERE t.id_transaction = '${id_transaction}' ${where}
                    ORDER BY t.created_at DESC`;
        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    findAll = async (page = 1, limit = 10) => {
        let offset = (page - 1) * limit;
        let total = `SELECT count(*) as count FROM ${this.table}`;
        let sql = `SELECT * FROM ${this.table} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

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

    insert = async (datas) => {
        let id_transaction = await createUUID("T");
        const user_id = datas.user_id;
        const sender_name = datas.sender_name;
        const destination = datas.destination;
        const content = datas.content;
        const price = datas.price ?? 0;
        const status_code = datas.status_code ?? 0;

        let sql = `INSERT INTO ${this.table} (id_transaction, user_id, sender_name, destination, content, price, status_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const data = await db.query(sql, [
            id_transaction,
            user_id,
            sender_name,
            destination,
            content,
            price,
            status_code,
        ]);

        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    update = async (transactionID, datas) => {
        const routingDetailID = datas.routingdetail_id;
        const messageID = datas.message_id;
        const status_code = datas.status_code || 0;
        const access = datas.access || null;
        const message_status = datas.message_status || null;

        let sql = `UPDATE ${this.table} SET routingdetail_id = $1, messageid = $2, status_code = $3, access = $4, message_status = $5 WHERE id_transaction = $6 RETURNING *`;
        const data = await db.query(sql, [
            routingDetailID,
            messageID,
            status_code,
            access,
            message_status,
            transactionID,
        ]);

        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    updateDate = async (datas, note) => {
        let sql,
            sqlSet,
            params,
            status,
            statusCode = "3";
        const dateNow = new Date();
        switch (note) {
            case "time_send":
                status = true;
                sqlSet = `time_send = $1, status_code = $4`;
                params = [
                    dateNow,
                    datas.message_id,
                    datas.license_key,
                    statusCode,
                ];
                break;
            case "time_receive":
                status = true;
                sqlSet = `time_receive = $1, status_code = $4`;
                params = [
                    dateNow,
                    datas.message_id,
                    datas.license_key,
                    statusCode,
                ];
                break;
            case "time_read":
                status = true;
                sqlSet = `time_read = $1, status_code = $4`;
                params = [
                    dateNow,
                    datas.message_id,
                    datas.license_key,
                    statusCode,
                ];
                break;
            default:
                status = false;
                break;
        }
        if (status === true) {
            sql = `UPDATE transactions t
                    SET ${sqlSet}
                    FROM routing_details rd
                    JOIN provider_details pd ON pd.id = rd.providerdetail_id
                    WHERE rd.id = t.routingdetail_id AND t.messageid = $2 AND pd.license_key = $3`;
            const data = await db.query(sql, params);
            if (data.rows.length === 0) return null;
            return data.rows[0];
        }
        return null;
    };

    updateByField = async (transactionID, datas) => {
        const updated_at = new Date();

        let update = "";
        if ("routingdetail_id" in datas)
            update += `routingdetail_id = '${datas.routingdetail_id}', `;
        if ("sender_name" in datas)
            update += `sender_name = '${datas.sender_name}', `;
        if ("access" in datas) update += `access = '${datas.access}', `;
        if ("destination" in datas)
            update += `destination = '${datas.destination}', `;
        if ("content" in datas) update += `content = '${datas.content}', `;
        if ("image" in datas) update += `image = '${datas.image}', `;
        if ("price" in datas) update += `price = '${datas.price}', `;
        if ("status_code" in datas)
            update += `status_code = '${datas.status_code}', `;
        if ("messageid" in datas)
            update += `messageid = '${datas.messageid}', `;
        if ("message_status" in datas)
            update += `message_status = '${datas.message_status}', `;
        if ("time_send" in datas)
            update += `time_send = '${datas.time_send}', `;
        if ("time_receive" in datas)
            update += `time_receive = '${datas.time_receive}', `;
        if ("time_read" in datas)
            update += `time_read = '${datas.time_read}', `;
        if ("optional_id" in datas)
            update += `optional_id = '${datas.optional_id}', `;
        if ("created_at" in datas)
            update += `created_at = '${toPostgresTimestamp(
                datas.created_at
            )}', `;
        update += `updated_at = $2`;

        let sql = `UPDATE ${this.table} SET ${update} WHERE id_transaction = $1 RETURNING *`;
        const data = await db.query(sql, [transactionID, updated_at]);

        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    /*updateDLR = async (licenseKey, messageID) => {
        select t.* 
        FROM transactions t 
        left join routing_details rd on rd.id = t.routingdetail_id
        left join provider_details pd on pd.id = rd.providerdetail_id 
        where t.messageid = '3EB0C25489AFDABC8B354F' and pd.license_key = '748ab35514a1214c011aeb9144cf0f971efd' 
    };*/
}

module.exports = new TransactionModel();
