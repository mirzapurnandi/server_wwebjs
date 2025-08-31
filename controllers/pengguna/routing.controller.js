const routingService = require("../../services/routing.service");
const responseHandler = require("../../utils/responseHandler");

class routingController {
    createRouting = async (req, res, next) => {
        try {
            const routing = await routingService.insertDataRouting(req.body, {
                user_id: req.user.id,
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

    createEngine = async (req, res, next) => {
        try {
            const result = await routingService.insertDataEngine(
                req.body,
                req.user
            );
            return responseHandler.success(
                res,
                "Sukses menambahkan Engine",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 25;
            const result = await routingService.getAllData(
                page,
                limit,
                req.user.id
            );
            return responseHandler.success(res, "Get All Routings", result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const id = req.params.id;
            const userID = req.user.id;
            const resultData = await routingService.getDataByID(id, userID);
            const resultDetail = await routingService.getRoutingDetail(
                id,
                page
            );
            return responseHandler.success(res, "Get Detail Routings", {
                data: resultData,
                detail: resultDetail,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new routingController();
