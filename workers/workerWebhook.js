const { Worker, Job } = require("bullmq");
const transactionService = require("../services/transaction.service");

const worker = new Worker(
    "Webhook",
    async (job) => {
        try {
            if (job.name === "send_webhook") {
                const { transaction_id, status, method, url } = job.data;
                await transactionService.sendDataTransaction(
                    transaction_id,
                    status,
                    method,
                    url
                );
                return "done"; // biar ada returnValue
            }
        } catch (err) {
            console.error(`❌ Error in job ${job.id}:`, err);
            throw err; // penting biar BullMQ detect failed
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
        concurrency: 20,
    }
);

worker.on("failed", async (job, err) => {
    console.error(`❌ Job ${job.id} failed with error:`, err);
});

console.log("Worker Webhook started!");
