const handphoneService = require("../../services/handphone.service");
const responseHandler = require("../../utils/responseHandler");

class handphoneController {
    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 100;
            const is_active = req.query.is_active || true;
            const is_used = req.query.is_used || null;
            const result = await handphoneService.getAllData({
                page: parseInt(page),
                limit: parseInt(limit),
                is_active: is_active,
                is_used: is_used,
            });
            return responseHandler.success(res, "Get All Handphone", result);
        } catch (error) {
            next(error);
        }
    };

    /* getById = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const userID = req.query.user_id;
            const id = req.params.id;
            const resultData = await routingService.getDataByID(id, userID);
            const resultDetail = await routingService.getRoutingDetail(
                id,
                parseInt(page)
            );
            return responseHandler.success(res, "Get Detail Routings", {
                data: resultData,
                detail: resultDetail,
            });
        } catch (error) {
            next(error);
        }
    }; */
}

module.exports = new handphoneController();
