const { Worker, Job } = require("bullmq");
const sendEmailAccountCreated = require("../mail/sendEmailAccountCreated");

const worker = new Worker(
    "Defaults",
    async (job) => {
        if (job.name === "send_email") {
            const { name, email } = job.data;
            await sendEmailAccountCreated({ name, email });
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

console.log("Worker Defaults started!");
