const providerService = require("../../services/provider.service");
const engineService = require("../../services/engine.service");
const responseHandler = require("../../utils/responseHandler");

class providerController {
    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const result = await providerService.getAllData(page);
            return responseHandler.success(res, "Get All Providers", result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await providerService.getDataByID(id);
            const engine = await engineService.getData(id);
            return responseHandler.success(res, "Get Detail Providers", {
                result,
                engine,
            });
        } catch (error) {
            next(error);
        }
    };

    insertData = async (req, res, next) => {
        try {
            const result = await providerService.insertData(req.body);
            let message = "successfully inserted provider";
            return responseHandler.success(res, message, result, 201);
        } catch (error) {
            next(error);
        }
    };

    updateData = async (req, res, next) => {
        try {
            const result = await providerService.updateData(
                req.params.id,
                req.body
            );
            let message = "successfully updated provider";
            return responseHandler.success(res, message, result, 200);
        } catch (error) {
            next(error);
        }
    };

    deleteData = async (req, res, next) => {
        try {
            const id = req.params.id;
            const provider = await providerService.deleteData(id);
            return res.status(200).json({
                status: true,
                message: "successfully deleted provider",
                data: provider,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new providerController();
