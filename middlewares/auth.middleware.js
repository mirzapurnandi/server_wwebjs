const responseHandler = require("../utils/responseHandler");
const { verifyAccessToken } = require("../utils/jwt.helper");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]; //Bearer TOKEN
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return responseHandler.error(res, "Access Token Empty", null, 401);

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return responseHandler.error(res, "Refresh Token Empty", null, 401);

    const user = verifyAccessToken(token) ?? null;
    if (!user) return responseHandler.error(res, "Token Expired", null, 419);

    req.user = user;
    next();
}

module.exports = authenticateToken;
