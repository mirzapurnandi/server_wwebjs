// workers/ecosystem.config.js
module.exports = {
    apps: [
        // Server utama
        /* {
            name: "server",
            script: "./server.js",
            interpreter: "bun",
            //cwd: path.join(__dirname, ".."),
            watch: false,
            autorestart: true,
            restart_delay: 5000,
            out_file: "./logs/server-out.log",
            error_file: "./logs/server-error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
        }, */
        // Worker utama
        {
            name: "worker-main",
            script: "./workers/worker.js",
            // interpreter: "node",
            //cwd: path.join(__dirname, "."),
            // watch: false,
            // autorestart: true,
            // restart_delay: 5000,
            out_file: "./logs/worker-main-out.log",
            error_file: "./logs/worker-main-error.log",
            env: {
                windowsHide: false,
            },
        },

        // workerInitSender.js pakai Node
        {
            name: "worker-init-sender",
            script: "./workers/workerInitSender.js",
            interpreter: "node",
            // cwd: path.join(__dirname, "."),
            // watch: false,
            // autorestart: true,
            // restart_delay: 5000,
            out_file: "./logs/worker-init-sender-out.log",
            error_file: "./logs/worker-init-sender-error.log",
            env: {
                windowsHide: false,
            },
        },

        // workerPointBalance.js pakai Node
        {
            name: "worker-point-balance",
            script: "./workers/workerPointBalance.js",
            // interpreter: "node",
            // cwd: path.join(__dirname, "."),
            // watch: false,
            // autorestart: true,
            // restart_delay: 5000,
            out_file: "./logs/worker-point-balance-out.log",
            error_file: "./logs/worker-point-balance-error.log",
            env: {
                windowsHide: false,
            },
        },

        // workerSendMessage.js pakai Node
        {
            name: "worker-send-message",
            script: "workers/workerSendMessage.js",
            // interpreter: "node",
            // cwd: path.join(__dirname, "."),
            // watch: false,
            // autorestart: true,
            // restart_delay: 5000,
            out_file: "./logs/worker-send-message-out.log",
            error_file: "./logs/worker-send-message-error.log",
            env: {
                windowsHide: false,
            },
        },
    ],
};
