const walletService = require("../../services/wallet.service");
const { queuePoint } = require("../../config/queueBullMQ");
const responseHandler = require("../../utils/responseHandler");

class walletController {
    push = async (req, res, next) => {
        try {
            const type = "push";
            const { email, point } = req.body;

            const result = await walletService.check(email);
            queuePoint.add("point_balance", { email, point, type });
            return responseHandler.success(
                res,
                "Successfully Push Wallet",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    pull = async (req, res) => {
        try {
            const type = "pull";
            const { email, point } = req.body;

            const wallet = await walletService.check(email);
            if (wallet.error == true) {
                return res.status(404).json(wallet);
            }
            queuePoint.add("point_balance", { email, point, type });
            return res.status(200).json(wallet);
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: error.message,
            });
        }
    };
}

module.exports = new walletController();
