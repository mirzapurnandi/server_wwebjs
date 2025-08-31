const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt.helper");
const { validateRegistration, validateLogin } = require("../requests/auth.request");
const authService = require("../services/auth.service");
const responseHandler = require("../utils/responseHandler");

class authController {
    registrasi = async (req, res, next) => {
        try {
            await validateRegistration(req.body);
            const user = await authService.registerUser(req.body);
            return responseHandler.success(res, "Sukses registrasi", user, 201);
        } catch (error) {
            next(error);
        }
    };

    login = async (req, res, next) => {
        try {
            await validateLogin(req.body);

            const users = await authService.loginUser(req.body);
            let accessToken = generateAccessToken(users);
            let refreshToken = generateRefreshToken(users);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                sameSite: "Lax", // "Strict", "None"
                secure: false, // true,
            });
            res.cookie("userId", users.id, {
                httpOnly: true,
                sameSite: "Lax", // "Strict", "None"
                secure: false, // true,
            });
            const result = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
            req.refreshToken = refreshToken;
            await authService.saveToken(users.id, accessToken, refreshToken);
            return responseHandler.success(res, "Sukses login", result);
        } catch (error) {
            next(error);
        }
    };

    refresh = async (req, res, next) => {
        const userId = req.cookies.userId;
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken || !userId) return responseHandler.error(res, "Refresh Token Empty", null, 401);

        try {
            const checkToken = await authService.findToken(userId);
            if (checkToken.refresh_token === refreshToken) {
                const user = verifyRefreshToken(refreshToken, userId);
                if(!user){
                    await res.clearCookie("refreshToken");
                    await res.clearCookie("userId");
                    return responseHandler.error(res, "Refresh Token Expired, Please Login Again", null, 401);
                }
                const newAccessToken = generateAccessToken(user);
                return responseHandler.success(res, "Success Generate Access Token", newAccessToken);
            }
            return responseHandler.error(res, "Data Not Found", null, 404);
        } catch (error) {
            next(error);
        }
    }

    logout = async (req, res, next) => {
        try {
            const userId = req.cookies.userId;
            const refreshToken = req.cookies.refreshToken;
            await authService.updateToken(userId, refreshToken);
            await res.clearCookie("refreshToken");
            await res.clearCookie("userId");
            return responseHandler.success(res, "Logout Successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new authController();
