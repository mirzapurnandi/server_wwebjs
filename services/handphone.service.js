const handphoneModel = require("../models/handphone.model");
const CustomError = require("../helpers/customError");
/* const {
    validateInsertProvider,
    validateUpdateProvider,
} = require("../requests/provider.request"); */

class handphoneService {
    /**
     * @param {number} page - Page Number
     */
    getAllData = async (datas) => {
        const result = await handphoneModel.findAll(datas);
        if (!result) throw new CustomError("Data Not Found", 404);
        return result;
    };

    /**
     * @param {number} id - Page Number
     */
    getDataByID = async (id) => {
        const result = await providerModel.findOne(id);
        if (!result) throw new CustomError("Data Not Found", 404);
        return result;
    };

    /* updateData = async (id, reqBody) => {
        await validateUpdateProvider(reqBody);

        if (reqBody.url && reqBody.apikey) {
            const check = await engineService.getData({
                url: reqBody.url,
                apikey: reqBody.apikey,
            });
            if (!check) throw new CustomError("URL Not Found", 404);
        }

        const result = await providerModel.update(id, reqBody);
        if (!result) {
            throw new CustomError("Gagal menyimpan data provider", 400);
        }
        return result;
    }; */
}

module.exports = new handphoneService();
