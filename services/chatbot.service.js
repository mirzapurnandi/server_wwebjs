const handphoneSettings = require("../models/handphoneSetting.model");
const handphoneMerks = require("../models/handphoneMerk.model");
const handphones = require("../models/handphone.model");
const keywords = require("../models/keyword.model");
const engineService = require("./engine.service");

class ChatbotService {
    async handleSapaLocal(data, id_instance) {
        const from = data.from; // Nomor pengirim (628xxx)
        const incomingText = data.content.toLowerCase().trim();
        const to = data.to.split("@")[0];

        // 1. Cek Settings (Sama seperti sebelumnya)
        const settings = await handphoneSettings.getByInstance(to);
        if (!settings || settings.type !== "sapa_local" || !settings.is_active)
            return;

        // 2. Logika "Daftar" (Hardcoded Priority)
        if (incomingText.toLowerCase().startsWith("daftar ")) {
            // Pisahkan teks berdasarkan spasi
            const parts = incomingText.split(/\s+/); // Menggunakan regex \s+ agar jika spasi double tetap aman

            // Validasi: Pastikan minimal ada 3 bagian (kata 'daftar', 'merk', dan 'no_hp')
            if (parts.length < 5) {
                let message =
                    "⚠️ Format salah.\nKetik: *daftar [Merk] [No_HP] [Type] [Urutan]*\nContoh: daftar A-00 6285277788833 a 1";
                return await engineService.sendMessage(
                    id_instance,
                    from,
                    message,
                );
            }

            const merkName = parts[1]; // Mengambil A-00
            const manualPhone = parts[2]; // Mengambil 6285277788833
            const type = parts[3]; // Mengambil type a,b,c,d
            const urutan = parts[4]; // Mengambil Urutan
            const email = parts[5] ?? null; // Mengambil email
            return await this.processRegistration(
                id_instance,
                from,
                merkName,
                manualPhone,
                type,
                urutan,
                email,
            );
        }

        const checkIncome = incomingText.toLowerCase().split(/\s+/);
        const checkIncomeField = checkIncome[0];
        const checkIncomeValue = checkIncome[1] ?? null;

        const allowedFields = ["email", "type", "is_active", "urutan"];

        if (
            allowedFields.includes(checkIncomeField) &&
            checkIncomeValue !== null
        ) {
            return await this.processUpdate(
                id_instance,
                from,
                checkIncomeField,
                checkIncomeValue,
            );
        }

        // 4. Logika Keyword Dinamis (Halo Jarvis & Child Keywords)
        const matchKeyword = await keywords.getByNameAndPhone(
            incomingText,
            settings.no_hp,
        );

        if (matchKeyword) {
            const children = await keywords.getChilds(matchKeyword.id);
            let responseMsg = `${matchKeyword.message_reply || "Halo! Berikut perintah yang tersedia:"}\n\n`;

            if (children.length > 0) {
                children.forEach((child) => {
                    responseMsg += `• *${child.name.toUpperCase()}*\n_${child.note}_\n\n`;
                });
            }
            return await engineService.sendMessage(
                id_instance,
                from,
                responseMsg.trim(),
            );
        }
    }

    async processRegistration(
        instanceId,
        fromLid,
        merkName,
        manualPhone,
        type,
        urutan,
        email = null,
    ) {
        // 1. Normalisasi nomor yang diinput manual (menghilangkan spasi/simbol/awalan 0)
        let cleanId = manualPhone.replace(/[^0-9]/g, "");
        if (cleanId.startsWith("0")) {
            cleanId = "62" + cleanId.slice(1);
        }
        let message;

        // 2. Cek apakah nomor tersebut (PK) sudah ada di tabel handphones
        const existingById = await handphones.getById(cleanId);
        if (existingById) {
            message = `❌ Nomor ${cleanId} sudah terdaftar.`;
            return await engineService.sendMessage(
                instanceId,
                fromLid,
                message,
            );
        }

        // 3. Cek apakah identitas WhatsApp (@lid) ini sudah pernah mendaftarkan nomor lain
        const existingByLid = await handphones.getByIdUnik(fromLid);
        if (existingByLid) {
            message = `❌ Akun WhatsApp ini sudah terdaftar dengan nomor ${existingByLid.id}. Satu akun hanya bisa mendaftarkan satu nomor.`;
            return await engineService.sendMessage(
                instanceId,
                fromLid,
                message,
            );
        }

        // 4. Cek validasi Merk
        const merk = await handphoneMerks.getByName(merkName);
        if (!merk) {
            message = `⚠️ Merk *${merkName}* tidak valid.`;
            return await engineService.sendMessage(
                instanceId,
                fromLid,
                message,
            );
        }

        // 5. Simpan ke database
        try {
            await handphones.insert({
                id: cleanId, // '6285277788833'
                id_unik: fromLid, // '86677473206436@lid'
                handphonemerk_id: merk.id,
                is_active: true,
                type: type,
                urutan: urutan,
                email: email,
            });

            message = `✅ Berhasil Terdaftar!\n\nID: ${cleanId}\nMerk: ${merk.name}\nStatus: Aktif\nType: ${type}\nUrutan: ${urutan}`;
            if (email != null) message += `\nEmail: ${email}`;
            return await engineService.sendMessage(
                instanceId,
                fromLid,
                message,
            );
        } catch (err) {
            console.error("Insert Error:", err);
            return await engineService.sendMessage(
                instanceId,
                fromLid,
                "❌ Terjadi kesalahan saat menyimpan data.",
            );
        }
    }

    async processUpdate(instanceId, from, field, value) {
        let datas,
            message = null;
        const existingByLid = await handphones.getByIdUnik(from);
        if (!existingByLid) {
            return await engineService.sendMessage(
                instanceId,
                from,
                "⚠️ Anda belum terdaftar. Silakan ketik *daftar [Merk]* terlebih dahulu.",
            );
        }
        switch (field) {
            case "email":
                datas = { email: value };
                message = `📧 Email berhasil diperbarui menjadi: *${value}*`;
                break;
            case "urutan":
                datas = { urutan: value };
                message = `Urutan berhasil diperbarui menjadi: *${value}*`;
                break;
            case "type":
                datas = { type: value };
                message = `Type berhasil diperbarui menjadi: *${value}*`;
                break;
            case "is_active":
                datas = { is_active: value };
                message = `isActive berhasil diperbarui menjadi: *${value}*`;
                break;
        }

        if (message !== null) {
            await handphones.update(from, datas, "id_unik");
            return await engineService.sendMessage(instanceId, from, message);
        }
        return null;
    }
}

module.exports = new ChatbotService();
