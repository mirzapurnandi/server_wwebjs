const providerDetailModel = require("../models/providerDetail.model");
const walletService = require("./wallet.service");
const engineService = require("./engine.service");
const routingModel = require("../models/routing.model");
const routingDetailModel = require("../models/routingDetail.model");
const CustomError = require("../helpers/customError");
const db = require("../config/db/connection").getPool();
const {
    validateCreateRouting,
    validateCreateEngine,
    validateAddEngine,
} = require("../requests/routing.request");

class routingService {
    getAllData = async (page, limit = 25, UserID) => {
        const result = await routingModel.findAll(page, limit, UserID);
        if (!result) throw new CustomError("Data Not Found", 404);
        return result;
    };

    getDataByID = async (id, userID = null) => {
        const result = await routingModel.findOne(id, userID);
        if (!result) throw new CustomError("Data Not Found", 404);
        return result;
    };

    getRoutingDetail = async (routingID, page, limit = 25) => {
        const result = await routingModel.findRoutingDetail(
            routingID,
            page,
            limit
        );
        if (!result) throw new CustomError("Data Not Found", 404);
        return result;
    };

    insertDataRouting = async (reqBody, reqData) => {
        await validateCreateRouting(reqBody);
        const checkSenderName = await routingModel.checkSenderName(
            reqBody.sender_name
        );
        if (checkSenderName.rows.length > 0) {
            throw new CustomError("Maaf, Nama Sender sudah ada", 400);
        }

        const result = routingModel.insert({
            sender_name: reqBody.sender_name,
            user_id: reqData.user_id,
            type: reqBody.type,
            delay: reqBody.delay,
            price: reqBody.price ?? 50000,
            price_per_message: reqBody.price_per_message ?? 50,
        });
        if (!result) throw new CustomError("Gagal menyimpan data routing", 400);
        return result;
    };

    insertDataEngine = async (reqBody, reqUser) => {
        const client = await db.connect();
        let licenseKey;
        let providerID = reqBody.provider_id;
        let routingID = reqBody.routing_id;
        await validateCreateEngine(reqBody);
        try {
            await client.query("BEGIN");

            const routings = await this.getDataByID(routingID, reqUser.id);

            let price = routings.price;
            await walletService.processing(reqUser.email, price, client);

            const engineCreate = await engineService.insertData(
                providerID,
                client
            );
            if (engineCreate.status !== 201) {
                throw new CustomError(engineCreate.message, 400);
            }

            licenseKey = await engineCreate.id_instance;
            const userID = reqUser.id;

            const result = await providerDetailModel.insert(
                {
                    provider_id: providerID,
                    user_id: userID,
                    license_key: licenseKey,
                    price: price,
                },
                client
            );

            if (!result) {
                throw new CustomError("Gagal menyimpan data provider", 400);
            }
            const providerDetail = result.rows[0];

            const resultRoutingDetail = await routingDetailModel.insert(
                {
                    routing_id: routingID,
                    providerdetail_id: providerDetail.id,
                },
                client
            );
            if (!resultRoutingDetail) {
                throw new CustomError(
                    "Gagal menyimpan data routing_details",
                    400
                );
            }
            const routingDetail = resultRoutingDetail.rows[0];

            const resultRouting = await routingModel.increment(
                routingID,
                null,
                client
            );
            if (!resultRouting) {
                throw new CustomError(
                    "Gagal Menambahkan data count routing",
                    400
                );
            }

            await client.query("COMMIT");
            return {
                engine: engineCreate,
                provider_detail: providerDetail,
                routing_detail: routingDetail,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            await engineService.deleteData(licenseKey, providerID);
            throw new CustomError(
                "Maaf, harus ROLLBACK karena ada query gagal",
                400,
                error
            );
        } finally {
            client.release();
        }
    };

    addEngine = async (reqBody) => {
        await validateAddEngine(reqBody);
        const result = await routingDetailModel.insert({
            routing_id: reqBody.routing_id,
            providerdetail_id: reqBody.providerdetail_id,
            is_backup: reqBody.is_backup,
        });
        if (!result) {
            throw new CustomError("Gagal menyimpan data routing_details", 400);
        }

        const isBackup = reqBody.is_backup === true ? "backup" : null;
        await routingModel.increment(reqBody.routing_id, isBackup, null);

        return result.rows[0];
    };

    deleteEngine = async (id) => {
        const result = await routingDetailModel.delete(id);
        if (!result) {
            throw new CustomError("Gagal menghapus data routing_details", 400);
        }
        const isBackup = result.is_backup === true ? "backup" : null;
        await routingModel.decrement(
            parseInt(result.routing_id),
            isBackup,
            null
        );
        return true;
    };
}

module.exports = new routingService();
