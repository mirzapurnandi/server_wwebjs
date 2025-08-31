const db = require("../config/db/connection");
const uuid = require("uuid");

class WalletModel {
    constructor() {
        this.table = "wallets";
        this.table_detail = "wallet_details";
    }

    findOneByEmail = async (email, status = true) => {
        if (!email) return null;
        let sql = `SELECT * FROM wallets where status = ${status} and email = '${email}'`;
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

    insert = async (data) => {
        const email = data.email;
        const point_balance = data.point_balance || 0;
        const status = data.status || true;

        let sql = `INSERT INTO ${this.table} (email, point_balance, status) VALUES ($1, $2, $3) RETURNING *`;
        return await db.query(sql, [email, point_balance, status]);
    };

    insertDetail = async (data, client = null) => {
        const wallet_id = data.wallet_id;
        const point = data.point;
        const info = data.info;
        const wallettype = data.wallettype;
        const created_at = new Date();

        let Uuid = uuid.v4();
        let uuids = Uuid.split("-").join("W");

        let sql = `INSERT INTO ${this.table_detail} (wallet_id, point, info, wallettype, uuid, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const executor = client || db;
        return await executor.query(sql, [
            wallet_id,
            point,
            info,
            wallettype,
            uuids,
            created_at,
        ]);
    };

    update_point = async (email, point_balance, note, client = null) => {
        let sqlSet = "";
        if (note === "IN") {
            sqlSet = `point_balance = point_balance + ${point_balance}`;
        } else {
            sqlSet = `point_balance = point_balance - ${point_balance}`;
        }
        let sql = `UPDATE ${this.table} SET ${sqlSet} WHERE email = '${email}' RETURNING *`;
        const executor = client || db;
        const data = await executor.query(sql);
        if (data.rows.length === 0) return null;
        return data.rows[0];
    };

    delete = async (email) => {
        let sql = `DELETE FROM ${this.table} WHERE email = '${email}'`;
        return await db.query(sql);
    };
}

module.exports = new WalletModel();
