const { Worker, Job } = require("bullmq");
const walletService = require("../services/wallet.service");
// const messageService = require("./services/message.service");

const worker = new Worker(
    "PointBalance",
    async (job) => {
        if (job.name === "point_balance") {
            const { email, point, type } = job.data;
            if (type == "push") {
                await walletService.push(email, point);
            } else if (type == "pull") {
                await walletService.pull(email, point);
            } else if (type == "processing") {
                await walletService.processing(email, point);
            }
        } /* else if (job.name === "sending_message") {
            const { transaction_id, type } = job.data;
            if (type == "insert") {
                await messageService.sendMessage(transaction_id);
            }
        } */
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);

worker.on("completed", async (job, result) => {
    console.log(`Job ${job.id} completed with result ${result}`);
    // Menghapus job yang telah selesai dari Redis
    // await job.remove();
    // console.log(`Job ${job.id} removed from Redis`);
});

console.log("Worker started!");
