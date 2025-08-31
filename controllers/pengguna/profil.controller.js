const userService = require("../../services/user.service");
const walletService = require("../../services/wallet.service");
const responseHandler = require("../../utils/responseHandler");

class userController {
    index = async (req, res, next) => {
        try {
            const { id } = req.user;
            const users = await userService.getData(id);
            return responseHandler.success(res, "Get Profile User", users);
        } catch (error) {
            next(error);
        }
    };

    point = async (req, res, next) => {
        try {
            const { email } = req.user;
            const wallets = await walletService.getData(email);
            return responseHandler.success(res, "Get Point User", wallets);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new userController();
