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
    getData = async (provider_id) => {
        try {
            const getProvider = await provider.findOne(provider_id);
            const result = await axios.get(getProvider.url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-purnand-token": getProvider.apikey,
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
                    }
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
                }
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
                }
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
                }
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
                }
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
                }
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
                }
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
        type = null
    ) => {
        try {
            const getProvider = await providerDetailModel.findByID(
                1,
                id_instance,
                "providers"
            );
            const uri =
                type === "typing" ? "/send-message-typing" : "/send-message";
            const result = await axios.post(
                getProvider.url + uri,
                {
                    id_instance: id_instance,
                    destination: destination,
                    message: message,
                    delay: delay,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-purnand-token": getProvider.apikey,
                    },
                }
            );
            logger.info("Axios Result: ", result.data);
            return {
                status: result.status,
                data: result.data,
            };
        } catch (error) {
            logger.error(`Axios Catch Error: ${error.message}`);
            return {
                status: error.status,
                message: error.message,
            };
        }
    };
}

module.exports = new engineService();
