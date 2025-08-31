const Validator = require("validatorjs");
const validator = async (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.setAttributeNames({ name: "Nama" });
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};
module.exports = validator;
