const validator = require("../helpers/validate");
const CustomError = require("../helpers/customError");

const validateCreateInstance = async (data) => {
    const validationRule = {
        sender_name: "required",
        type: ["required", { in: ["INTERACTIVE", "BROADCAST", "OTP"] }],
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        in: ":attribute tidak sesuai",
    };

    return new Promise((resolve, reject) => {
        validator(data, validationRule, validationMessage, (err, status) => {
            if (!status)
                return reject(
                    new CustomError("Validation failed", 422, err.errors)
                );
            resolve();
        });
    });
};

module.exports = {
    validateCreateInstance,
};
