const { Worker, Job } = require("bullmq");
const messageService = require("../services/message.service");

const worker = new Worker(
    "SendMessage",
    async (job) => {
        if (job.name === "sending_message") {
            const { type, dataTransaction, dataSender, dataDelay } = job.data;
            if (type == "insert") {
                const result = await messageService.sendMessage(
                    dataTransaction,
                    dataSender,
                    dataDelay
                );
                return result;
            }
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
});

console.log("Worker SendMessage started!");
