const providerModel = require("../models/provider.model");
const providerDetailModel = require("../models/providerDetail.model");
const engineService = require("../services/engine.service");
const CustomError = require("../helpers/customError");

class senderService {
    insertData = async (reqBody) => {
        const checkAvailableProvider = await providerModel.findOne(null, true);
        if (!checkAvailableProvider) {
            return res.status(401).send({
                error: true,
                message: "Maaf, Server Penuh...",
            });
        }
    };

    getDataByInstance = async (idInstance) => {
        const providerDetail = await providerDetailModel.findByID(
            null,
            idInstance
        );
        if (!providerDetail) {
            throw new CustomError("Data Not Found", 404, providerDetail);
        }

        const refresh = await engineService.refreshInstance(
            idInstance,
            providerDetail.provider_id
        );

        return {
            provider_detail: providerDetail,
            refresh_instance: refresh,
        };
    };

    getDataQRInstance = async (idInstance) => {
        const providerDetail = await providerDetailModel.findByID(
            null,
            idInstance
        );
        if (!providerDetail) {
            throw new CustomError("Data Not Found", 404, providerDetail);
        }

        const qr = await engineService.getQR(
            idInstance,
            providerDetail.provider_id
        );

        return {
            provider_detail: providerDetail,
            qr_instance: qr,
        };
    };

    getDataScreenshootInstance = async (idInstance) => {
        const providerDetail = await providerDetailModel.findByID(
            null,
            idInstance
        );
        if (!providerDetail) {
            throw new CustomError("Data Not Found", 404, providerDetail);
        }

        const ss = await engineService.getScreenshot(
            idInstance,
            providerDetail.provider_id
        );

        return {
            provider_detail: providerDetail,
            ss_instance: ss,
        };
    };

    redeployDataInstance = async (idInstance) => {
        const providerDetail = await providerDetailModel.findByID(
            null,
            idInstance
        );
        if (!providerDetail) {
            throw new CustomError("Data Not Found", 404, providerDetail);
        }

        const qr = await engineService.redeployInstance(
            idInstance,
            providerDetail.provider_id
        );

        return {
            provider_detail: providerDetail,
            qr_instance: qr,
        };
    };

    getDataStatusInstance = async (idInstance) => {
        const providerDetail = await providerDetailModel.findByID(
            null,
            idInstance
        );
        if (!providerDetail) {
            throw new CustomError("Data Not Found", 404, providerDetail);
        }

        const status = await engineService.statusInstance(
            idInstance,
            providerDetail.provider_id
        );
        if (status && status.info != null) {
            let description = `${status.info.pushname} || ${status.info.wid.user}`;
            await providerDetailModel.update(providerDetail.id, {
                description,
            });
            providerDetail.description = description;
            providerDetail.label = status.state;
            providerDetail.is_active =
                status.state === "CONNECTED" ? true : false;
        }

        return {
            provider_detail: providerDetail,
            status_instance: status,
        };
    };
}

module.exports = new senderService();
