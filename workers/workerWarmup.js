// workers/workerWarmup.js
const { Worker } = require("bullmq");
const engineService = require("../services/engine.service");
const warmupService = require("../services/warmup.service");

const worker = new Worker(
    "Warmup",
    async (job) => {
        // --- Job 1: Inisiasi Pertama (Step 1) ---
        if (job.name === "start_warmup") {
            const { initiator_id, destination_hp } = job.data;

            // Panggil fungsi pemantik dengan membawa parameter destinasi
            const result = await warmupService.startInitialWarmup(
                initiator_id,
                destination_hp,
            );
            return result;
        }

        // --- Job 2: Balasan Reaktif (Step 2-10) ---
        if (job.name === "send_warmup_reply") {
            const { id_instance, destination, message, engineDelay, media } =
                job.data;

            if (media) {
                console.log(
                    `[WORKER] Mengirim Media (Base64) ke ${destination}`,
                );
                // Kita akan mengirim media object ini ke engineService
                await engineService.sendMessageMedia(
                    id_instance,
                    destination,
                    message,
                    media, // Mengirim object { base64_data, mimetype, filename }
                    engineDelay,
                    "typing",
                    `WARMUP-REPLY-${Date.now()}`,
                );
            } else {
                console.log(`[WORKER] Mengirim Teks ke ${destination}`);
                await engineService.sendMessage(
                    id_instance,
                    destination,
                    message,
                    engineDelay,
                    "typing",
                    `WARMUP-REPLY-${Date.now()}`,
                );
            }
            return true;
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
        concurrency: 10, // Izinkan 5 balasan berjalan bersamaan
    },
);

worker.on("completed", async (job, result) => {
    // console.log(`Warmup Job ${job.id} completed.`);
});

console.log("Worker Warmup started!");
