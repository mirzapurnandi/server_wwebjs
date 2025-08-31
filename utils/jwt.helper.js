const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");

const jwtSecret = process.env.JWT_SECRET || "jkasdbiaebhydbasuyhbajsdbhajdb";
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "ururyeywehncxkw3erk34ndhhdj33";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

const generateAccessToken = ({ id, name, email, level }) => {
    const user = { id, name, email, level };
    return jwt.sign(user, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};

const generateRefreshToken = ({ id, name, email, level }) => {
    const user = { id, name, email, level };
    return jwt.sign(user, jwtRefreshSecret, {
        expiresIn: jwtRefreshExpiresIn,
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtSecret, (error, user) => {
        if (error) return null;
        return user;
    });
};

/**
 * @param {string} token - Refresh Token
 * @param {string} userId - User ID
 */
const verifyRefreshToken = (token, userId) => {
    return jwt.verify(token, jwtRefreshSecret, (error, result)  => {
        if (error) {
            authService.updateToken(userId, token).then(r => {
                return null;
            });
        }
        return result;
    })
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
