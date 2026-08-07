const defaultService = require("./extends/default.service");
const transactionModel = require("../models/transaction.model");
const authModel = require("../models/auth.model");
const https = require("https");
const axios = require("axios");
const logger = require("../utils/logger");
const CustomError = require("../helpers/customError");
const { queueInitSender, queueWebhook } = require("../config/queueBullMQ");
const routingModel = require("../models/routing.model");
const crypto = require("crypto");
const moment = require("moment-timezone");

class transactionService extends defaultService {
    getDataTransaction = async (idTransaction, userID) => {
        const getTransaction = await transactionModel.findByID(
            idTransaction,
            userID,
        );
        if (!getTransaction) throw new CustomError("Data Not Found", 404);

        return getTransaction;
    };

    getAllData = async (data) => {
        const result = await transactionModel.findAll(
            data.page,
            data.user_id,
            data.sender_name,
            data.status_code,
            data.limit,
        );
        if (!result) {
            throw new CustomError("Gagal Query Provider", 400);
        }
        return result;
    };

    filterDataTransaction = async (reqBody) => {
        const getTransaction = await transactionModel.findByDate(
            reqBody.status_code,
            reqBody.date,
            reqBody.sender_name,
            reqBody.limit,
            reqBody.crack,
        );
        if (!getTransaction) throw new CustomError("Data Not Found", 404);

        let checkUserPrivate,
            messageStatus = "",
            sendWebhook = false,
            totalSending = 0;
        let getOneTransaction = getTransaction[0].user_id;

        checkUserPrivate = await authModel.checkUserPrivate(
            getOneTransaction,
            null,
            "intern",
        );

        if (
            checkUserPrivate &&
            checkUserPrivate.method != null &&
            checkUserPrivate.url != null
        ) {
            sendWebhook = true;
        }

        if (reqBody.type == "send") {
            const delayMax = Math.floor(Math.random() * (340 - 260 + 1)) + 260;
            await routingModel.update(reqBody.sender_name, {
                delay_max: delayMax,
            });
            const delayMaxDef = reqBody.crack == 4 ? 4 : null;
            for await (const row of getTransaction) {
                queueInitSender.add("processing_data", {
                    transaction_id: row.id_transaction,
                    delayMaxDefault: delayMaxDef,
                });
            }
        } else if (reqBody.type == "change_1" && reqBody.status_code == 0) {
            for await (const row of getTransaction) {
                let dateNow = moment()
                    .tz("Asia/Jakarta")
                    .format("YYYY-MM-DD HH:mm:ss.SSS");
                let messageID = row.messageid;
                let routingdetailID = row.routingdetail_id;
                if (row.messageid === null) {
                    messageID = crypto
                        .randomBytes(11)
                        .toString("hex")
                        .toUpperCase();
                    messageStatus = "CRACK";
                    routingdetailID = null;
                }

                await transactionModel.updateByField(row.id_transaction, {
                    routingdetail_id: routingdetailID,
                    status_code: 1,
                    messageid: messageID,
                    message_status: messageStatus,
                    time_send: dateNow,
                    // created_at: dateNow,
                });

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: row.id_transaction,
                        status: "sent",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                    totalSending++;
                }
            }
        } else if (reqBody.type == "change_2" && reqBody.status_code == 0) {
            for await (const row of getTransaction) {
                messageStatus = "CRACK";
                await transactionModel.updateByField(row.id_transaction, {
                    status_code: 2,
                    message_status: messageStatus,
                });

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: row.id_transaction,
                        status: "failed",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                    totalSending++;
                }
            }
        } else if (
            reqBody.type == "change_3" &&
            (reqBody.status_code == 0 || reqBody.status_code == 1)
        ) {
            for await (const row of getTransaction) {
                let dateNow = moment()
                    .tz("Asia/Jakarta")
                    .format("YYYY-MM-DD HH:mm:ss.SSS");
                let messageID = row.messageid;
                let routingdetailID = row.routingdetail_id;
                messageStatus = "CRACK";
                if (row.messageid === null) {
                    messageID = crypto
                        .randomBytes(11)
                        .toString("hex")
                        .toUpperCase();
                    routingdetailID = null;
                }

                await transactionModel.updateByField(row.id_transaction, {
                    routingdetail_id: routingdetailID,
                    status_code: 3,
                    messageid: messageID,
                    message_status: messageStatus,
                    time_receive: dateNow,
                });

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: row.id_transaction,
                        status: "delivered",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                    totalSending++;
                }
            }
        } else if (
            reqBody.type == "change_333" &&
            (reqBody.status_code == 0 || reqBody.status_code == 1)
        ) {
            let hit = 0;
            for await (const row of getTransaction) {
                let dateNow = moment()
                    .tz("Asia/Jakarta")
                    .format("YYYY-MM-DD HH:mm:ss.SSS");
                let messageID = row.messageid;
                let routingdetailID = row.routingdetail_id;
                messageStatus = "CRACK";
                if (row.messageid === null) {
                    messageID = crypto
                        .randomBytes(11)
                        .toString("hex")
                        .toUpperCase();
                    routingdetailID = null;
                }

                await transactionModel.updateByField(row.id_transaction, {
                    routingdetail_id: routingdetailID,
                    status_code: 3,
                    messageid: messageID,
                    message_status: messageStatus,
                    time_receive: dateNow,
                });

                if (sendWebhook) {
                    const randomInterval =
                        Math.floor(Math.random() * (650 - 180 + 1)) + 180;
                    hit += randomInterval;
                    queueWebhook.add(
                        "send_webhook",
                        {
                            transaction_id: row.id_transaction,
                            status: "delivered",
                            method: checkUserPrivate.method,
                            url: checkUserPrivate.url,
                        },
                        {
                            delay: hit,
                        },
                    );
                    totalSending++;
                }
            }
        } else if (
            reqBody.type == "change_4" &&
            (reqBody.status_code == 1 || reqBody.status_code == 3)
        ) {
            for await (const row of getTransaction) {
                let dateNow = moment()
                    .tz("Asia/Jakarta")
                    .format("YYYY-MM-DD HH:mm:ss.SSS");
                let messageID = row.messageid;
                let routingdetailID = row.routingdetail_id;
                messageStatus = "CRACK";
                if (row.messageid === null) {
                    messageID = crypto
                        .randomBytes(11)
                        .toString("hex")
                        .toUpperCase();
                    routingdetailID = null;
                }

                await transactionModel.updateByField(row.id_transaction, {
                    routingdetail_id: routingdetailID,
                    status_code: 4,
                    messageid: messageID,
                    message_status: messageStatus,
                    time_read: dateNow,
                });

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: row.id_transaction,
                        status: "read",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                    totalSending++;
                }
            }
        }

        return {
            total: getTransaction.length,
            sending: totalSending,
            data: getTransaction,
        };
    };

    sendDataTransaction = async (idTransaction, status, method, url) => {
        try {
            const checkTransaction =
                await this.getDataTransaction(idTransaction);
            if (!checkTransaction) {
                throw new Error(`Transaction ${idTransaction} not found`);
            }

            console.log("📤 Sending webhook with data:", {
                id_transaction: checkTransaction.id_transaction,
                status,
                method,
                url,
            });

            await this.sendDataAxios(method, url, {
                id_transaction: checkTransaction.id_transaction,
                messageid: checkTransaction.messageid,
                sender_name: checkTransaction.sender_name,
                destination: checkTransaction.destination,
                content: checkTransaction.content,
                price: checkTransaction.price,
                status: status,
                time_send: checkTransaction.time_send,
                time_receive: checkTransaction.time_receive,
                time_read: checkTransaction.time_read,
                created_at: checkTransaction.created_at,
            });

            return true;
        } catch (err) {
            console.error("❌ sendDataTransaction Error:", err);
            throw err; // jangan swallow error, biar ketangkap di worker.on("failed")
        }
    };

    sendDataAxios = async (method, url, data) => {
        try {
            const agent = new https.Agent({ family: 4 }); // paksa IPv4
            const axiosOptions = {
                headers: { "Content-Type": "application/json" },
                timeout: 15000, // 15 detik timeout
                httpsAgent: agent,
            };

            if (method.toUpperCase() === "POST") {
                await axios.post(url, data, axiosOptions);
            } else if (method.toUpperCase() === "GET") {
                await axios.get(url, { params: data });
            }

            logger.info(
                `✅ Axios Result: ${
                    data.status
                } [${method.toUpperCase()}] ${url}`,
            );
        } catch (error) {
            if (error.response) {
                console.error(
                    "❌ Axios Response Error:",
                    error.response.status,
                    error.response.data,
                );
            } else if (error.request) {
                console.error("❌ Axios No Response:", error.request);
            } else {
                console.error("❌ Axios Setup Error:", error.message);
            }
            throw error; // lempar lagi ke worker biar masuk failed
        }
    };
}

module.exports = new transactionService();
