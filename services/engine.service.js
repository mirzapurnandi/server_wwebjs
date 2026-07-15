const axios = require("axios");
const provider = require("../models/provider.model");
const { createUUID } = require("../utils/helper");
const providerDetailModel = require("../models/providerDetail.model");
const logger = require("../utils/logger");
const CustomError = require("../helpers/customError");

class engineService {
    /**
     * @typedef {Object} RequestData
     * @property {string} url - URL endpoint yang akan diakses
     * @property {string} apikey - API key untuk autentikasi
     */

    /**
     * Mengambil data dari API dengan metode GET
     * @param {RequestData} data - { url: string, apikey: string}
     */
    getData = async (datas) => {
        try {
            const result = await axios.get(datas.url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-purnand-token": datas.apikey,
                },
            });
            logger.info("Axios Result:", result.data);
            return result.data.data;
            // return !!(result.data && result.data.message === "Success");
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    insertData = async (provider_id, client = null) => {
        try {
            const id_instance = await createUUID(provider_id);
            const getProvider = await provider.findOne(provider_id);
            let message;
            if (getProvider) {
                const increment = await provider.increment(provider_id, client);
                if (increment == false) {
                    message = "Gagal menambahkan Count di Server";
                    logger.error(`Axios Error: ${message}`);
                    return {
                        status: increment,
                        message: message,
                    };
                }

                const result = await axios.post(
                    getProvider.url,
                    {
                        id_instance: id_instance,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-purnand-token": getProvider.apikey,
                        },
                    },
                );

                logger.info("Axios Result: ", result.data);
                return {
                    status: result.status,
                    id_instance: result.data.id_instance,
                    data: result.data,
                };
            }

            message = "Provider Not Found";
            logger.error(`Axios Error: ${message}`);
            return {
                status: 400,
                message: message,
            };
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            return {
                status: error.status,
                message: error.message,
            };
        }
    };

    deleteData = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.delete(
                getProvider.url + "/" + id_instance,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );

            await provider.decrement(provider_id);
            logger.info("Axios Result: ", result.status);
            return result.status;
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            return error.message;
        }
    };

    refreshInstance = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.post(
                getProvider.url + "/instance-refresh",
                {
                    id_instance: id_instance,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );
            logger.info("Axios Result: ", result.data);
            return {
                status: result.status,
                message: result.data.details,
            };
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    getQR = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.get(
                getProvider.url + "/qr?type=image&id_instance=" + id_instance,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );
            logger.info("Axios Result: ", result.data);
            return result.data;
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    getScreenshot = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.get(
                getProvider.url + "/screenshot?id_instance=" + id_instance,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );
            logger.info("Axios Result: ", result.data);
            return result.data;
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    redeployInstance = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.post(
                getProvider.url + "/instance-redeploy",
                {
                    id_instance: id_instance,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );
            logger.info("Axios Result: ", result.data);
            return result.data;
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    statusInstance = async (id_instance, provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.post(
                getProvider.url + "/status",
                {
                    id_instance: id_instance,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                },
            );
            logger.info("Axios Result: ", result.data);
            if (result.data) {
                return result.data.data;
            }
            return null;
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            throw new CustomError(error.message, 400);
        }
    };

    sendMessage = async (
        id_instance,
        destination,
        message,
        delay,
        type = null,
        id_transaction = null,
        footer_msg = null,
        header_msg = null,
    ) => {
        try {
            const getProvider = await providerDetailModel.findByID(
                1,
                id_instance,
                "providers",
            );

            let uri =
                type === "typing" ? "/send-message-typing" : "/send-message";
            if (delay <= 1)
                uri =
                    type === "typing"
                        ? "/send-message"
                        : "/send-message-typing";

            const result = await axios.post(
                getProvider.url + uri,
                {
                    id_instance: id_instance,
                    destination: destination,
                    message: message,
                    delay: delay,
                    id_transaction: id_transaction,
                    footer_msg: footer_msg,
                    header_msg: header_msg,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                    family: 4,
                    timeout: 15000,
                },
            );
            logger.info("Axios Result: ", result.data);
            return {
                status: result.status,
                data: result.data,
            };
        } catch (error) {
            /* logger.error(`Axios Catch Error: ${error.message}`);
            return {
                status: error.status,
                message: error.message,
            }; */
            if (error.code === "ECONNABORTED") {
                logger.error(`Axios Timeout: Request took longer than 15s`);
                return {
                    status: 500, // Anggap 500 agar trigger Backup Sender
                    message: "Gateway Timeout (Engine No Response)",
                };
            }
            // Handle Engine Mati / Refused
            if (error.code === "ECONNREFUSED") {
                return {
                    status: 500, // Anggap 500 agar trigger Backup Sender
                    message: "Connection Refused (Engine Down)",
                };
            }

            logger.error(`Axios Catch Error: ${error.message}`);
            return {
                status: error.response ? error.response.status : 500,
                message: error.message,
            };
        }
    };

    sendMessageMedia = async (
        id_instance,
        destination,
        message,
        mediaData,
        delay,
        type = null,
        id_transaction = null,
        footer_msg = null,
        header_msg = null,
    ) => {
        try {
            const getProvider = await providerDetailModel.findByID(
                1,
                id_instance,
                "providers",
            );
            const uri =
                type === "typing" ? "/send-media-typing" : "/send-media";

            // Siapkan payload default
            let payload = {
                id_instance: id_instance,
                destination: destination,
                message: message,
                delay: delay,
                id_transaction: id_transaction,
                footer_msg: footer_msg,
                header_msg: header_msg,
            };

            // Cek apakah ini Base64 (dari Warmup) atau file_url (dari Blast biasa)
            if (typeof mediaData === "object" && mediaData.base64_data) {
                payload.base64_data = mediaData.base64_data;
                payload.mimetype = mediaData.mimetype;
                payload.filename = mediaData.filename;
            } else {
                // Backward compatibility untuk fitur blast excel yang lama
                payload.file_url = mediaData;
            }

            const result = await axios.post(getProvider.url + uri, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-purnand-token": getProvider.apikey,
                },
                family: 4,
                timeout: 15000,
            });
            return { status: result.status, data: result.data };
        } catch (error) {
            if (error.code === "ECONNABORTED") {
                return { status: 500, message: "Media Gateway Timeout" };
            }
            logger.error(`Axios Catch Error: ${error.message}`);
            return {
                status: error.response ? error.response.status : 500,
                message: error.message,
            };
        }
    };
}

module.exports = new engineService();
