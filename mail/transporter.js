const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "b266b9e31dc9cf",
        pass: "f7eca371a44d85",
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
