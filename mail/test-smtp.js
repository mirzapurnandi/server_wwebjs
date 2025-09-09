const nodemailer = require("nodemailer");

async function testSMTP() {
    const transporter = nodemailer.createTransport({
        host: "mail.wasend.id",
        port: 465, // coba 465 dulu, kalau gagal bisa ubah ke 587
        secure: true, // true untuk 465, false untuk 587
        auth: {
            user: "noreply@wasend.id",
            pass: "Masyithah1302.",
        },
        tls: {
            rejectUnauthorized: false, // biar gak error kalau SSL self-signed
        },
    });

    /* const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465, // coba 465 dulu, kalau gagal bisa ubah ke 587
        secure: true, // true untuk 465, false untuk 587
        auth: {
            user: "noreply@sociafeed.com",
            pass: "DGArukanD6!",
        },
        tls: {
            rejectUnauthorized: false, // biar gak error kalau SSL self-signed
        },
    }); */

    try {
        await transporter.verify();
        console.log("✅ SMTP server connection SUCCESS");
    } catch (error) {
        console.error("❌ SMTP server connection FAILED:", error);
    }
}

testSMTP();
