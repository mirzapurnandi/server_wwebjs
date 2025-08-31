const providerModel = require("../models/provider.model");
const engineService = require("./engine.service");
const CustomError = require("../helpers/customError");
const {
    validateInsertProvider,
    validateUpdateProvider,
} = require("../requests/provider.request");

class providerService {
    /**
     * @param {number} page - Page Number
     */
    getAllData = async (page) => {
        const result = await providerModel.findAll(page);
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

    insertData = async (reqBody) => {
        await validateInsertProvider(reqBody);

        const check = await engineService.getData({
            url: reqBody.url,
            apikey: reqBody.apikey,
        });
        if (!check) throw new CustomError("URL Not Found", 404);

        const checkUrl = await providerModel.findByUrl(reqBody.url);
        if (checkUrl) throw new CustomError("URL Ready in Database", 400);

        const result = await providerModel.insert({
            name: reqBody.name,
            code: reqBody.code,
            method: reqBody.method,
            url: reqBody.url,
            apikey: reqBody.apikey,
            pwdkey: reqBody.pwdkey,
            is_ssl: reqBody.is_ssl,
            status: reqBody.status,
            total: reqBody.total,
            description: reqBody.description,
        });
        if (!result)
            throw new CustomError("Gagal menyimpan data provider", 400);
        return result;
    };

    updateData = async (id, reqBody) => {
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
    };

    deleteData = async (id) => {
        const result = await providerModel.delete(id);
        if (!result) {
            throw new CustomError("Gagal menyimpan data provider", 400);
        }
        return true;
    };
}

module.exports = new providerService();
