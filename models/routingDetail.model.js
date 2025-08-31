const db = require("../config/db/connection");
const uuid = require("uuid");

class RoutingDetailModel {
    findOne = async (id) => {
        if (!id) return null;

        let sql = `SELECT rd.*, r.sender_name, r.count as routing_count, r.backup as routing_backup, r.type as routing_type, r.delay as routing_delay, r.price as routing_price, r.price_per_message as routing_price_per_message
                    FROM routing_details as rd 
                    JOIN routings r ON r.id = rd.routing_id
                    WHERE rd.id = '${id}' `;
        sql += `ORDER BY rd.created_at ASC LIMIT 1`;

        const data = await db.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    insert = async (data, client = null) => {
        const routing_id = data.routing_id;
        const providerdetail_id = data.providerdetail_id;
        const status = data.status ?? true;
        const is_backup = data.is_backup ?? true;
        const created_at = new Date();

        let Uuid = uuid.v4();
        let uuids = Uuid.split("-").join("RD");

        let sql = `INSERT INTO routing_details (routing_id, providerdetail_id, status, uuid, is_backup, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`;
        const executor = client || db;
        return await executor.query(sql, [
            routing_id,
            providerdetail_id,
            status,
            uuids,
            is_backup,
            created_at,
        ]);
    };

    updateUsedAt = async (routingDetailID, usedAt, transactionID = null) => {
        const updatedAt = new Date();

        let sql = `UPDATE routing_details SET used_at = $1, updated_at = $2 WHERE id = $3 RETURNING *`;
        const data = await db.query(sql, [usedAt, updatedAt, routingDetailID]);

        if (transactionID !== null) {
            await db.query(
                `UPDATE transactions SET created_at = $1, updated_at = $2 WHERE id_transaction = $3 RETURNING *`,
                [usedAt, updatedAt, transactionID]
            );
        }

        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    delete = async (id) => {
        const routingDetail = await this.findOne(id);
        if (routingDetail) {
            let sql = `DELETE FROM routing_details WHERE id = $1`;
            await db.query(sql, [id]);
            return routingDetail;
        }
        return null;
    };
}

module.exports = new RoutingDetailModel();
