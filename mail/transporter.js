const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "mail.wasend.id",
    port: 465,
    secure: true,
    auth: {
        user: "noreply@wasend.id",
        pass: "Masyithah1302.",
    },
});

// checking connection
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Mail server is running...");
    }
});
module.exports = transporter;
