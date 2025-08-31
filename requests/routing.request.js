const validator = require("../helpers/validate");
const CustomError = require("../helpers/customError");

const runValidation = (data, rules, messages) => {
    return new Promise((resolve, reject) => {
        validator(data, rules, messages, (err, status) => {
            if (!status) {
                return reject(
                    new CustomError("Validation failed", 422, err.errors)
                );
            }
            resolve();
        });
    });
};

const validateCreateRouting = async (data) => {
    const validationRule = {
        sender_name: "required",
        type: ["required", { in: ["INTERACTIVE", "BROADCAST", "OTP"] }],
        delay: "required|min:4|numeric",
        price: "numeric",
        price_per_message: "numeric",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        in: ":attribute tidak sesuai",
    };

    return runValidation(data, validationRule, validationMessage);
};

const validateCreateEngine = async (data) => {
    const validationRule = {
        provider_id: "required",
        routing_id: "required",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
    };

    return runValidation(data, validationRule, validationMessage);
};

const validateAddEngine = async (data) => {
    const validationRule = {
        routing_id: "required",
        providerdetail_id: "required",
        is_backup: "required|boolean",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        boolean: ":attribute harus true atau false",
    };

    return runValidation(data, validationRule, validationMessage);
};

module.exports = {
    validateCreateRouting,
    validateCreateEngine,
    validateAddEngine,
};
