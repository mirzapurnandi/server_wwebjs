const providerDetailService = require("../../services/providerDetail.service");
const senderService = require("../../services/sender.service");
const responseHandler = require("../../utils/responseHandler");

class providerDetailController {
    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 25;

            const result = await providerDetailService.getAllData({
                provider_id: null,
                page: page,
                limit: limit,
                user_id: req.user.id,
            });

            return responseHandler.success(
                res,
                "successfully show data Instance",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    refreshInstance = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.getDataByInstance(id_instance);
            return responseHandler.success(
                res,
                "Refresh data Instance",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    getQRInstance = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.getDataQRInstance(id_instance);
            return responseHandler.success(res, "get data QR Instance", result);
        } catch (error) {
            next(error);
        }
    };

    redeployInstance = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.redeployDataInstance(
                id_instance
            );
            return responseHandler.success(
                res,
                "redeploy data Instance",
                result
            );
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new providerDetailController();
