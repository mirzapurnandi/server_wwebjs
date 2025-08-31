const CustomError = require("../helpers/customError");
const logger = require("../utils/logger");
const responseHandler = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        const datas = err.data || null;
        logger.error(err.message, datas);
        return responseHandler.error(res, err.message, datas, err.statusCode);
    }

    // Handle other unknown errors
    logger.error(err);
    return responseHandler.error(res, "Internal Server Error", err, 500);
};

module.exports = errorHandler;
