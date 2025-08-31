const userModel = require("../models/user.model");
const walletModel = require("../models/wallet.model");
const CustomError = require("../helpers/customError");

class walletService {
    getData = async (email) => {
        const wallet = await walletModel.findOneByEmail(email);
        if (!wallet) throw new CustomError("Data Not Found", 404);
        return wallet;
    };

    check = async (email) => {
        const user = await userModel.find(email, true);
        if (!user) throw new CustomError("User Not Found!!!", 404);

        const wallet = await walletModel.findOneByEmail(email);
        if (!wallet) throw new CustomError("Wallet Not Found!!!", 404);
        return wallet;
    };

    push = async (email, point) => {
        const wallet = await walletModel.findOneByEmail(email);
        if (!wallet) throw new CustomError("Wallet Not Found!!!", 404);

        let point_balance = parseInt(point);
        const updateWallet = await walletModel.update_point(
            email,
            point_balance,
            "IN"
        );

        walletModel.insertDetail({
            wallet_id: wallet.id,
            point: parseInt(point),
            info: "Push Data Wallet",
            wallettype: "IN",
        });

        return updateWallet;
    };

    pull = async (email, point, client = null) => {
        const wallet = await walletModel.findOneByEmail(email);
        if (!wallet) throw new CustomError("Wallet Not Found!!!", 404);

        let point_balance = parseInt(point);
        const updateWallet = await walletModel.update_point(
            email,
            point_balance,
            "OUT",
            client
        );

        walletModel.insertDetail(
            {
                wallet_id: wallet.id,
                point: parseInt(point),
                info: "Pull Data Wallet",
                wallettype: "OUT",
            },
            client
        );

        return {
            error: false,
            message: `Pull Data Wallet`,
            result: updateWallet,
        };
    };

    processing = async (email, point, client = null) => {
        // check point
        const check = await this.check(email);
        if (parseInt(check.point_balance) < parseInt(point)) {
            throw new CustomError("Points are not Enough", 400);
        }

        return await this.pull(email, point, client);
    };
}

module.exports = new walletService();
