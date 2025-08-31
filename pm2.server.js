// Load .env
require("dotenv").config();
const path = require("path");

const bunPath = `${process.env.HOME}/.bun/bin:${process.env.PATH}`;
const logsDir = path.join(__dirname, "logs");

module.exports = {
    apps: [
        // Server pakai Bun
        {
            name: "pm2.server",
            script: "server.js",
            interpreter: "bun",
            env: {
                PATH: bunPath,
            },
            out_file: `${logsDir}/server-out.log`,
            error_file: `${logsDir}/server-error.log`,
            log_date_format: "YYYY-MM-DD HH:mm:ss",
        },

        // Worker 1
        {
            name: "pm2.workerInitSender",
            script: "workers/workerInitSender.js",
            interpreter: "node",
            out_file: `${logsDir}/workerInitSender-out.log`,
            error_file: `${logsDir}/workerInitSender-error.log`,
            log_date_format: "YYYY-MM-DD HH:mm:ss",
        },

        // Worker 2
        {
            name: "pm2.workerPointBalance",
            script: "workers/workerPointBalance.js",
            interpreter: "node",
            out_file: `${logsDir}/workerPointBalance-out.log`,
            error_file: `${logsDir}/workerPointBalance-error.log`,
            log_date_format: "YYYY-MM-DD HH:mm:ss",
        },

        // Worker 3
        {
            name: "pm2.workerSendMessage",
            script: "workers/workerSendMessage.js",
            interpreter: "node",
            out_file: `${logsDir}/workerSendMessage-out.log`,
            error_file: `${logsDir}/workerSendMessage-error.log`,
            log_date_format: "YYYY-MM-DD HH:mm:ss",
        },
    ],
};
