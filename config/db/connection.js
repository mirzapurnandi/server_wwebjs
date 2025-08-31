const pg = require("pg");
const { Pool } = pg;
const logger = require("../../utils/logger");

class DBConnection {
    constructor() {
        this.db = new Pool({
            user: process.env.DB_USER || "mirza",
            password: process.env.DB_PASSWORD || "Masyithah1302.",
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || "5432",
            database: process.env.DB_NAME || "db_wwebjs_new",
        });

        this.checkConnection();
    }

    checkConnection() {
        this.db.connect((err, client, release) => {
            if (err) {
                logger.error("Error acquiring client", err.stack);
                return;
            }
            if (client) {
                logger.info(`Postgres connection port:${client.port}`, {
                    function: "connection.checkConnection",
                });
                release();
            }
        });
    }

    async query(sql, param = []) {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    logger.error(`Info Querys sql: ${sql}, params: ${param}`, {
                        function: "connection.query",
                    });
                    reject(error);
                    return;
                }
                resolve(result);
            };
            this.db.query(sql, param, callback);
            logger.info(`Info Querys sql: ${sql}, params: ${param}`, {
                function: "connection.query",
            });
        }).catch((err) => {
            logger.error("Error catch querys: ", err);
            throw err;
        });
    }

    getPool() {
        return this.db;
    }
}

module.exports = new DBConnection();
