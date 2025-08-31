const responseHandler = require("../utils/responseHandler");

function checkLevel(req, res, next) {
    if (req.user.level !== "admin") {
        return responseHandler.error(res, "Anda Bukan Admin!", null);
    }
    next();
}

module.exports = { checkLevel };
