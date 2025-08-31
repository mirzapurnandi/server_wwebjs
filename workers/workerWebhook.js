const { Worker, Job } = require("bullmq");
const transactionService = require("../services/transaction.service");

const worker = new Worker(
    "Webhook",
    async (job) => {
        if (job.name === "send_webhook") {
            const { transaction_id, status } = job.data;
            await transactionService.sendDataTransaction(
                transaction_id,
                status
            );
        }
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

console.log("Worker Webhook started!");
