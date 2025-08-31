const responseHandler = require("../utils/responseHandler");
const { verifyUserPrivate } = require("../utils/auth.helper");

async function authenticateToken(req, res, next) {
    const userID = req.headers["userid"];
    const authHeader = req.headers["authorization"]; //Bearer TOKEN
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return responseHandler.error(res, "Passkey Empty", null, 401);

    const user = (await verifyUserPrivate(userID, token)) ?? null;
    if (!user) return responseHandler.error(res, "Token Wrong...", null, 419);

    req.user = user;
    next();
}

module.exports = authenticateToken;
