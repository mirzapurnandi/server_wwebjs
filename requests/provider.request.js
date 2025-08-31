const validator = require("../helpers/validate");
const CustomError = require("../helpers/customError");

const validateInsertProvider = async (data) => {
    const validationRule = {
        name: "required",
        code: "required",
        method: "required|in:POST,GET",
        url: "required",
        apikey: "required",
        is_ssl: "required|boolean",
        status: "required|boolean",
        total: "required|numeric",
        description: "string",
    };

    const validationMessage = {
        required: ":attribute harus diisi",
        boolean: ":attribute harus true atau false",
        numeric: ":attribute harus angka",
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

const validateUpdateProvider = async (data) => {
    const validationRule = {
        method: "in:POST,GET",
        is_ssl: "boolean",
        status: "boolean",
        total: "numeric",
        description: "string",
    };

    const validationMessage = {
        boolean: ":attribute harus true atau false",
        numeric: ":attribute harus angka",
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
    validateInsertProvider,
    validateUpdateProvider,
};
