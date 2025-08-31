const responseHandler = require("../utils/responseHandler");

function checkHeader(req, res, next) {
    const AUTH_TOKEN = process.env.AUTH_TOKEN || "PuRn4nD1990";
    if (req.headers["x-purnand-token"] !== AUTH_TOKEN) {
        return responseHandler.error(res, "Auth Headers Unauthorized", null);
    }
    next();
}

module.exports = checkHeader;
