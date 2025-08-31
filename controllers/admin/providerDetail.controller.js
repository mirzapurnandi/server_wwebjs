const providerDetailModel = require("../../models/providerDetail.model");
const engine = require("../../services/engine.service");
const senderService = require("../../services/sender.service");
const providerDetailService = require("../../services/providerDetail.service");
const responseHandler = require("../../utils/responseHandler");

class providerDetailController {
    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 25;
            const providerID = req.params.provider_id;

            const result = await providerDetailService.getAllData({
                provider_id: providerID,
                page: page,
                limit: limit,
            });

            return responseHandler.success(
                res,
                "successfully show All Provider Details",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    insertData = async (req, res, next) => {
        try {
            const userID = req.body.user_id ?? req.user.id;
            const reqData = {
                user_id: userID,
            };
            const result = await providerDetailService.insertData(
                req.body,
                reqData
            );
            return responseHandler.success(
                res,
                "Successfully inserted Provider Detail",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    updateData = async (req, res, next) => {
        try {
            const update = await providerDetailService.updateData(
                req.params.id,
                req.body
            );
            return responseHandler.success(
                res,
                "Successfully updated Provider Detail",
                update
            );
        } catch (error) {
            next(error);
        }
    };

    deleteData = async (req, res) => {
        const id = req.body.id;
        if (!id) {
            return res.status(401).send({
                message: "ID masih kosong",
            });
        }

        try {
            const detail = await providerDetailModel.find(id);
            const engineDelete = await engine.deleteData(
                detail.license_key,
                detail.provider_id
            );

            const deletes = await providerDetailModel.delete(id);
            if (deletes) {
                return res.status(200).json({
                    error: false,
                    message:
                        "successfully deleted provider detail & " +
                        engineDelete,
                    data: [],
                });
            }
        } catch (error) {
            return res.status(401).send({
                message: error.message,
            });
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

    getQR = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.getDataQRInstance(id_instance);
            return responseHandler.success(res, "get data QR Instance", result);
        } catch (error) {
            next(error);
        }
    };

    getScreenshoot = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.getDataScreenshootInstance(
                id_instance
            );
            return responseHandler.success(
                res,
                "get Data Screenshoot Instance",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    getStatus = async (req, res, next) => {
        const { id_instance } = req.body;
        try {
            const result = await senderService.getDataStatusInstance(
                id_instance
            );
            return responseHandler.success(
                res,
                "get Data Status Instance",
                result
            );
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
