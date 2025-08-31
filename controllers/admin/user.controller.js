const user = require("../../models/user.model");
const userPrivate = require("../../models/userPrivate.model");
const responseHandler = require("../../utils/responseHandler");

class userController {
    getAll = async (req, res, next) => {
        try {
            const { page, search } = req.query;
            const users = await user.findAll(page, 50);
            if (users)
                return responseHandler.success(res, "Get All Users", users);
            return responseHandler.error(res, "Data Not Found", null, 404);
        } catch (error) {
            next(error);
        }
    };

    upsertPrivateUser = async (req, res, next) => {
        try {
            const userID = req.body.user_id;
            const result = await userPrivate.upsert(userID);
            if (result)
                return responseHandler.success(
                    res,
                    "Successfully upsert UserPrivate",
                    result
                );
            return responseHandler.error(res, "Data Not Found", null, 404);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new userController();
