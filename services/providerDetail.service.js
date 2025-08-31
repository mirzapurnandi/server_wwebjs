const providerDetailModel = require("../models/providerDetail.model");
const routingModel = require("../models/routing.model");
const routingDetailModel = require("../models/routingDetail.model");
const walletService = require("./wallet.service");
const engineService = require("./engine.service");
const CustomError = require("../helpers/customError");
const {
    validateInsertProviderDetail,
    validateUpdateProviderDetail,
} = require("../requests/providerDetail.request");

class providerDetailService {
    getAllData = async (data) => {
        const result = await providerDetailModel.findAll(
            data.provider_id ?? null,
            data.page ?? 1,
            data.limit ?? 25,
            data.user_id ?? null
        );
        if (!result) {
            throw new CustomError("Gagal Query Provider", 400);
        }
        return result;
    };

    insertData = async (reqBody, reqData = {}) => {
        await validateInsertProviderDetail(reqBody);
        let providerID = reqBody.provider_id;
        let price = reqBody.price;
        let expired = reqBody.expired;

        const engineCreate = await engineService.insertData(providerID);
        if (engineCreate.status !== 201) {
            throw new CustomError(engineCreate.message, 400);
        }
        const license_key = await engineCreate.id_instance;

        const result = await providerDetailModel.insert({
            provider_id: providerID,
            user_id: reqData.user_id,
            license_key: license_key,
            price: price,
            expired: expired,
        });

        if (!result) {
            throw new CustomError("Gagal menyimpan data provider details", 400);
        }

        return result.rows[0];
    };

    updateData = async (id, reqBody) => {
        await validateUpdateProviderDetail(reqBody);
        const result = await providerDetailModel.update(id, reqBody);
        if (!result) {
            throw new CustomError("Gagal update data provider details", 400);
        }
        return result.rows[0];
    };

    /* insertFirstData = async ({ provider_id, sender_name, type }, user) => {
        await validateProviderDetail(reqBody);
        const checkSenderName = await routingModel.checkSenderName(sender_name);
        if (checkSenderName.rows.length > 0) {
            throw new CustomError("Maaf, Nama Sender sudah ada", 400);
        }

        let price = 20000;
        const check = await walletService.processing(user.email, price);
        if (check.error === true) {
            throw new CustomError(check.message, 400);
        }

        const engineCreate = await engineService.insertData(provider_id);
        if (engineCreate.status !== 201) {
            throw new CustomError(engineCreate.message, 400);
        }

        const license_key = await engineCreate.id_instance;
        const user_id = user.id;

        const result = await providerDetailModel.insert({
            provider_id,
            user_id,
            license_key,
            sender_name,
            price,
        });

        if (!result) {
            throw new CustomError("Gagal menyimpan data provider", 400);
        }
        const providerDetail = result.rows[0];

        const resultRouting = await routingModel.insert({
            sender_name,
            user_id,
            type,
            price,
        });
        if (!resultRouting) {
            throw new CustomError("Gagal menyimpan data routing", 400);
        }
        const routing = resultRouting.rows[0];

        const resultRoutingDetail = await routingDetailModel.insert({
            routing_id: routing.id,
            providerdetail_id: providerDetail.id,
        });
        if (!resultRoutingDetail) {
            throw new CustomError("Gagal menyimpan data routing_details", 400);
        }

        return providerDetail;
    }; */
}
module.exports = new providerDetailService();
