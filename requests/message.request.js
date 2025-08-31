const validator = require("../helpers/validate");
const CustomError = require("../helpers/customError");

const validateSendMessage = async (data) => {
    const validationRule = {
        sender_name: "required",
        destination: "required",
        content: "required",
    };
    const validationMessage = {
        required: ":attribute harus diisi",
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
    validateSendMessage,
};
