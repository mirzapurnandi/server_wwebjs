const { Worker, Job } = require("bullmq");
const messageService = require("../services/message.service");

const worker = new Worker(
    "InitSender",
    async (job) => {
        if (job.name === "processing_data") {
            const { transaction_id, delayMaxDefault } = job.data;
            const result = await messageService.processGetSender(
                transaction_id,
                delayMaxDefault,
            );
            return result;
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
        concurrency: 1,
    },
);

worker.on("completed", async (job, result) => {
    console.log(`Job ${job.id} completed with result ${result}`);
});

console.log("Worker InitSender started!");
