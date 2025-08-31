const validator = require("../helpers/validate");
const CustomError = require("../helpers/customError");

const validateRegistration = async (data) => {
    const validationRule = {
        email: "required|string|email",
        username: ["required", "regex:/^[a-z0-9_.]+$/"],
        name: "required|string",
        password: "required|string|min:6",
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

const validateLogin = async (data) => {
    const validationRule = {
        email: "required|email",
        password: "required",
    };

    const validationMessage = {};

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
    validateRegistration,
    validateLogin,
};
