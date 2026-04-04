// services/warmup.service.js
const db = require("../config/db/connection");
const { queueWarmup } = require("../config/queueBullMQ");
const engineService = require("./engine.service");
const fs = require("fs");
const path = require("path");

class warmupService {
    processSpintax = (text) => {
        return text.replace(/{([^{}]*)}/g, (match) => {
            const choices = match.slice(1, -1).split("|");
            return choices[Math.floor(Math.random() * choices.length)];
        });
    };

    handleWarmupReply = async (inboxData, receiver_instance_id) => {
        const text =
            inboxData.content || inboxData.caption || inboxData.body || "";
        const sender_hp = inboxData.from
            .replace("@c.us", "")
            .replace("@s.whatsapp.net", "");

        const match = text.match(/\[(\d+)\]/);
        if (!match) return;

        const currentStep = parseInt(match[1]);
        const nextStep = currentStep + 1;

        // 1. DINAMIS SAMPAI N: Cek apakah ada naskah untuk Step berikutnya
        const getMessages = await db.query(
            `SELECT content, status_image FROM warmup_messages WHERE type = $1`,
            [nextStep],
        );

        if (getMessages.rows.length === 0) {
            // Jika tidak ada data di DB, berarti skenario tamat (TIDAK ADA BATASAN HARUS 10)
            console.log(
                `[WARMUP-END] Skenario tamat di Step [${currentStep}]. Percakapan selesai.`,
            );
            return;
        }

        // 2. Pilih salah satu variasi secara acak
        const selectedRow =
            getMessages.rows[
                Math.floor(Math.random() * getMessages.rows.length)
            ];
        const finalContent = this.processSpintax(selectedRow.content);

        // 3. LOGIKA BASE64 GAMBAR ACAK (1 - 50)
        let mediaPayload = null;
        if (selectedRow.status_image) {
            const randomImgNumber = Math.floor(Math.random() * 50) + 1; // Angka 1 - 50

            // Asumsi folder 'images' sejajar dengan folder 'services' (berada di root project)
            const imagePath = path.join(
                __dirname,
                `../images/${randomImgNumber}.png`,
            );

            try {
                if (fs.existsSync(imagePath)) {
                    const fileBuffer = fs.readFileSync(imagePath);
                    mediaPayload = {
                        base64_data: fileBuffer.toString("base64"),
                        mimetype: "image/png",
                        filename: `${randomImgNumber}.png`,
                    };
                } else {
                    console.warn(
                        `[WARMUP] Gambar ${imagePath} tidak ditemukan! Mengirim tanpa gambar.`,
                    );
                }
            } catch (err) {
                console.error(`[WARMUP] Error membaca gambar:`, err.message);
            }
        }

        // 4. Kalkulasi Delay (Waktu baca + ngetik)
        const readDelay = Math.floor(Math.random() * 3000) + 3000;
        let typeDuration = finalContent.length * 200;
        if (selectedRow.status_image) typeDuration += 2000; // Tambah waktu seolah-olah sedang "memilih gambar"
        if (typeDuration > 10000) typeDuration = 10000;

        const totalDelayMs = readDelay + typeDuration;
        const engineDelaySec = Math.floor(typeDuration / 1000);

        console.log(
            `[WARMUP-DETECTED] Step [${currentStep}]. Queuing Reply [${nextStep}] in ${totalDelayMs}ms.`,
        );

        // 5. Masukkan ke Antrean
        queueWarmup.add(
            "send_warmup_reply",
            {
                id_instance: receiver_instance_id,
                destination: sender_hp,
                message: finalContent,
                engineDelay: engineDelaySec,
                media: mediaPayload, // Kirim payload Base64 ke worker
            },
            { delay: readDelay },
        );
    };

    startInitialWarmup = async (initiator_id, destination_hp) => {
        try {
            console.log(
                `[WARMUP-INIT] Memulai pemantik: ${initiator_id} -> ${destination_hp}`,
            );

            // 1. Ambil Naskah Step [1] dari Database
            const getStepOne = await db.query(
                `SELECT content, status_image FROM warmup_messages WHERE type = 1`,
            );

            if (getStepOne.rows.length === 0) {
                throw new Error("Naskah Step 1 kosong di database!");
            }

            // 2. Pilih salah satu variasi secara acak & Spintax
            const selectedRow =
                getStepOne.rows[
                    Math.floor(Math.random() * getStepOne.rows.length)
                ];
            const finalContent = this.processSpintax(selectedRow.content);

            // 3. Siapkan Media jika status_image = TRUE
            let mediaPayload = null;
            let typeDuration = finalContent.length * 200; // Simulasi ngetik

            if (selectedRow.status_image) {
                const randomImgNumber = Math.floor(Math.random() * 50) + 1;
                const imagePath = path.join(
                    __dirname,
                    `../images/${randomImgNumber}.png`,
                );

                if (fs.existsSync(imagePath)) {
                    const fileBuffer = fs.readFileSync(imagePath);
                    mediaPayload = {
                        base64_data: fileBuffer.toString("base64"),
                        mimetype: "image/png",
                        filename: `${randomImgNumber}.png`,
                    };
                    typeDuration += 2000; // Ekstra delay seolah memilih gambar
                }
            }

            if (typeDuration > 10000) typeDuration = 10000;
            const engineDelaySec = Math.floor(typeDuration / 1000);

            // 4. Tembak ke Engine (Media atau Teks Biasa)
            const trxId = `WARMUP-INIT-${Date.now()}`;

            if (mediaPayload) {
                await engineService.sendMessageMedia(
                    initiator_id,
                    destination_hp, // Langsung gunakan destination dari API
                    finalContent,
                    mediaPayload,
                    engineDelaySec,
                    "typing",
                    trxId,
                );
            } else {
                await engineService.sendMessage(
                    initiator_id,
                    destination_hp, // Langsung gunakan destination dari API
                    finalContent,
                    engineDelaySec,
                    "typing",
                    trxId,
                );
            }

            console.log(
                `[WARMUP-INIT] Berhasil memantik Step [1]: ${finalContent}`,
            );
            return true;
        } catch (error) {
            console.error(`[WARMUP-INIT ERROR] ${error.message}`);
            return false;
        }
    };
}

module.exports = new warmupService();
