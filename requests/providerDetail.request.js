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

const validateProviderDetail = async (data) => {
    const validationRule = {
        provider_id: "required",
        sender_name: "required",
        type: "required|in:INTERACTIVE,BROADCAST,OTP", // INTERACTIVE, BROADCAST, OTP
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        in: ":attribute hanya :in",
    };

    return runValidation(data, validationRule, validationMessage);
};

const validateInsertProviderDetail = async (data) => {
    const validationRule = {
        provider_id: "required",
        price: "required|numeric",
        expired: "required|numeric",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        numeric: ":attribute harus angka",
    };

    return runValidation(data, validationRule, validationMessage);
};

const validateUpdateProviderDetail = async (data) => {
    const validationRule = {
        is_active: "boolean",
        label: "in:ACTIVE,DISCONNECT,WAITING",
        expired: "date",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        in: ":attribute hanya :in",
        boolean: ":attribute harus boolean true atau false",
    };

    return runValidation(data, validationRule, validationMessage);
};

module.exports = {
    validateProviderDetail,
    validateInsertProviderDetail,
    validateUpdateProviderDetail,
};
