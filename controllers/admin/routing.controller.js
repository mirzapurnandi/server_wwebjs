const routingService = require("../../services/routing.service");
const responseHandler = require("../../utils/responseHandler");

class routingController {
    createRouting = async (req, res, next) => {
        try {
            const routing = await routingService.insertDataRouting(req.body, {
                user_id: req.body.user_id,
            });
            return responseHandler.success(
                res,
                "Sukses menambahkan Routing",
                routing
            );
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 50;
            const result = await routingService.getAllData(
                parseInt(page),
                parseInt(limit),
                null
            );
            return responseHandler.success(res, "Get All Routings", result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
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
    };

    addEngine = async (req, res, next) => {
        try {
            const result = await routingService.addEngine(req.body);
            return responseHandler.success(
                res,
                "Successfully add Engine",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    deleteEngine = async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await routingService.deleteEngine(id);
            return responseHandler.success(
                res,
                "Successfully Delete Engine",
                result
            );
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new routingController();
