const userModel = require("../models/user.model");
const CustomError = require("../helpers/customError");

class userService {
    getData = async (userId) => {
        const userData = await userModel.find(userId);
        if (!userData) throw new CustomError("Data Not Found", 404);
        return userData;
    }
}

module.exports = new userService();