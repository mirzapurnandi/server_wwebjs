const routingModel = require("../models/routing.model");
const routingDetailModel = require("../models/routingDetail.model");
const transactionModel = require("../models/transaction.model");
const messageModel = require("../models/message.model");
const providerDetailModel = require("../models/providerDetail.model");
const engineService = require("./engine.service");
const walletService = require("./wallet.service");
const authModel = require("../models/auth.model");
const handphoneModel = require("../models/handphone.model");
const handphoneBlockModel = require("../models/handphoneBlock.model");
const {
    queueInitSender,
    queueSendMessage,
    queueWebhook,
} = require("../config/queueBullMQ");
const CustomError = require("../helpers/customError");
const { addSeconds, differenceInSeconds } = require("date-fns");
const defaultService = require("./extends/default.service");
const xlsx = require("xlsx");
const fs = require("fs");
const {
    validateSendMessage,
    validateSendMessageMedia,
} = require("../requests/message.request");
const moment = require("moment-timezone");

class messageService extends defaultService {
    processSendMessage = async (
        reqBody,
        reqData,
        type = "text",
        privated = null,
    ) => {
        if (type == "media") {
            await validateSendMessageMedia(reqBody);
        } else {
            await validateSendMessage(reqBody);
        }
        const checkSenderName = await routingModel.checkSenderName(
            reqBody.sender_name,
        );
        const routing = checkSenderName.rows;
        if (routing.length == 0) {
            throw new CustomError("Maaf, Sender tidak ditemukan", 400);
        }

        const checkSender = await routingModel.getSender(
            reqData.user_id,
            reqBody.sender_name,
        );
        if (!checkSender) {
            throw new CustomError("Maaf, Engine tidak ada yang Aktif", 400);
        }

        let price = routing[0].price_per_message;
        await walletService.processing(reqData.email, price);

        let description =
            routing[0].footer_id == null
                ? reqBody.content
                : `${reqBody.content} ${routing[0].content}`;
        const insertTransaction = await transactionModel.insert({
            user_id: reqData.user_id,
            sender_name: reqBody.sender_name,
            destination: reqBody.destination,
            content: description,
            image: reqBody.file_url ?? null,
            price: price,
        });
        if (!insertTransaction) {
            throw new CustomError("Maaf, Transaksi gagal di input", 400);
        }

        if (privated === null) {
            queueInitSender.add("processing_data", {
                transaction_id: insertTransaction.id_transaction,
                delayMaxDefault: null,
            });
        }

        return insertTransaction;
    };

    processGetSender = async (transaction_id, delayMaxDefault = null) => {
        try {
            const getTransaction =
                await transactionModel.findByID(transaction_id);
            if (
                getTransaction &&
                (getTransaction.status_code == 0 ||
                    getTransaction.status_code == 1)
            ) {
                const getSender = await routingModel.getSender(
                    getTransaction.user_id,
                    getTransaction.sender_name,
                );

                if (getSender) {
                    const secondDelay = parseInt(getSender.delay);
                    const secondDelayMax =
                        delayMaxDefault == null
                            ? parseInt(getSender.delay_max)
                            : parseInt(delayMaxDefault);
                    const dateNow = moment()
                        .tz("Asia/Jakarta")
                        .format("YYYY-MM-DD HH:mm:ss.SSS");
                    let dateSave = dateNow;
                    let dataDelay = 200;
                    let checkDataDelay;

                    if (getSender.used_at === null) {
                        checkDataDelay = await this.processSettingDelay(
                            getTransaction,
                            dateNow,
                        );

                        if (checkDataDelay !== null) {
                            dataDelay = checkDataDelay * 1000;
                            dateSave = addSeconds(dateNow, checkDataDelay);
                        }
                    } else {
                        const usedAt = moment(getSender.used_at).tz(
                            "Asia/Jakarta",
                        );
                        const selisih = differenceInSeconds(usedAt, dateNow);

                        if (selisih < 0 && selisih + secondDelayMax <= 0) {
                            checkDataDelay = await this.processSettingDelay(
                                getTransaction,
                                dateNow,
                            );

                            if (checkDataDelay !== null) {
                                dataDelay = checkDataDelay * 1000;
                                dateSave = addSeconds(dateNow, checkDataDelay);
                            }
                        } else {
                            const totalDelay = selisih + secondDelayMax;
                            dateSave = addSeconds(usedAt, secondDelayMax);
                            dataDelay = totalDelay * 1000;
                        }
                    }

                    await routingDetailModel.updateUsedAt(
                        getSender.routingdetail_id,
                        dateSave,
                        getTransaction.id_transaction,
                    );

                    // send to queue
                    queueSendMessage.add(
                        "sending_message",
                        {
                            type:
                                delayMaxDefault == null ? "insert" : "checking",
                            dataTransaction: getTransaction,
                            dataSender: getSender,
                            dataDelay: secondDelay,
                        },
                        {
                            delay: dataDelay,
                            // removeOnComplete: true,
                        },
                    );
                    return getSender;
                } else {
                    // kirim notifikasi ke admin dari SLACK
                }
            }
            return false;
        } catch (error) {
            console.log(error);
        }
    };

    sendMessage = async (
        dataTransaction,
        dataSender,
        dataDelay,
        retry = 0,
        extraData = {},
    ) => {
        if (retry > 3) {
            console.log("Max retry reached");
            return false;
        }
        let statusCode = 0,
            sendWebhook = false,
            messageID = null,
            access = extraData.access || null,
            messageStatus = extraData.messageStatus || null;

        const checkUserPrivate = await authModel.checkUserPrivate(
            dataTransaction.user_id,
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

        try {
            const cleanDestination = dataTransaction.destination.split("@")[0];
            const isBlocked = await handphoneBlockModel.check(cleanDestination);

            if (isBlocked) {
                console.log(
                    `[BLACKLIST] Melewati pengiriman ke ${cleanDestination} (User telah Opt-Out)`,
                );

                // Set status seakan-akan sukses (Delivered) agar API pelanggan tidak error
                statusCode = 3;
                messageStatus = "BLOCKED_BY_USER_OPTOUT";

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: dataTransaction.id_transaction,
                        status: "delivered", // Kirim status delivered palsu
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                }

                const updateTransaction = await transactionModel.update(
                    dataTransaction.id_transaction,
                    {
                        routingdetail_id: dataSender.routingdetail_id,
                        message_id: "BLOCKED_OPT_OUT_" + Date.now(), // ID palsu
                        status_code: statusCode,
                        access: access,
                        message_status: messageStatus,
                    },
                );
                return updateTransaction; // Hentikan proses eksekusi di sini
            }

            let engineSendMessage;
            const finalContent = dataTransaction.content; //await this.obfuscateLinks(dataTransaction.content);
            if (dataTransaction.image == null) {
                engineSendMessage = await engineService.sendMessage(
                    dataSender.license_key,
                    dataTransaction.destination,
                    finalContent,
                    dataDelay,
                    "typing",
                    dataTransaction.id_transaction,
                    dataSender.footer_msg,
                    dataSender.header_msg,
                );
            } else {
                engineSendMessage = await engineService.sendMessageMedia(
                    dataSender.license_key,
                    dataTransaction.destination,
                    finalContent,
                    dataTransaction.image,
                    dataDelay,
                    "typing",
                    dataTransaction.id_transaction,
                    dataSender.footer_msg,
                    dataSender.header_msg,
                );
            }

            if (engineSendMessage.status == 200) {
                if (dataDelay == "BYPASS") {
                    statusCode = 1;
                    messageStatus = "CHECKING";
                } else {
                    const engine = engineSendMessage.data.data;
                    messageID = engine.id_message;
                    statusCode = 1;

                    if (sendWebhook) {
                        queueWebhook.add("send_webhook", {
                            transaction_id: dataTransaction.id_transaction,
                            status: "sent",
                            method: checkUserPrivate.method,
                            url: checkUserPrivate.url,
                        });
                    }
                }
            } else if (engineSendMessage.status == 500) {
                // Cari Engine Backup
                const getSender = await routingModel.getSender(
                    dataTransaction.user_id,
                    dataTransaction.sender_name,
                    "ASC",
                    true,
                );
                if (getSender) {
                    const dateSave = moment()
                        .tz("Asia/Jakarta")
                        .format("YYYY-MM-DD HH:mm:ss.SSS");
                    await routingDetailModel.updateUsedAt(
                        getSender.routingdetail_id,
                        dateSave,
                        dataTransaction.id_transaction,
                    );

                    return await this.sendMessage(
                        dataTransaction,
                        getSender,
                        dataDelay,
                        retry + 1,
                        {
                            access: dataSender.routingdetail_id,
                            messageStatus: "BACKUP",
                        },
                    );
                }

                statusCode = 2;
                await providerDetailModel.update(dataSender.id, {
                    label: "DISCONNECT",
                    is_active: false,
                });
                await handphoneModel.update(dataSender.handphone_id, {
                    is_recovery: false,
                });

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: dataTransaction.id_transaction,
                        status: "failed",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                }
            } else if (engineSendMessage.status == 400) {
                statusCode = 2;
                let statusKirim = "failed";
                /* if (
                    dataTransaction.sender_name.toLowerCase().includes("otp") ||
                    dataDelay == "BYPASS"
                ) {
                    statusCode = 3;
                    statusKirim = "delivered";
                } */

                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: dataTransaction.id_transaction,
                        status: statusKirim,
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                }
            } else {
                statusCode = 2;
                if (sendWebhook) {
                    queueWebhook.add("send_webhook", {
                        transaction_id: dataTransaction.id_transaction,
                        status: "failed",
                        method: checkUserPrivate.method,
                        url: checkUserPrivate.url,
                    });
                }
            }
        } catch (error) {
            statusCode = 2;
            if (sendWebhook) {
                queueWebhook.add("send_webhook", {
                    transaction_id: dataTransaction.id_transaction,
                    status: "failed",
                    method: checkUserPrivate.method,
                    url: checkUserPrivate.url,
                });
            }
            console.log(error);
        }

        const updateTransaction = await transactionModel.update(
            dataTransaction.id_transaction,
            {
                routingdetail_id: dataSender.routingdetail_id,
                message_id: messageID,
                status_code: statusCode,
                access: access,
                message_status: messageStatus,
            },
        );
        return updateTransaction;
    };

    obfuscateLinks = async (message) => {
        return message.replace(
            /\b(https?:\/\/)?((?:[\w-]+\.)+[a-z]{2,})(\/[^\s]*)?/gi,
            (match, protocol, domain, path) => {
                // ubah titik di domain menjadi '*'
                const obfuscatedDomain = domain.replace(/\./g, "*");
                // jika ada protocol, ubah menjadi tanpa 'http' agar lebih aman
                const proto = protocol ? "" : "";
                // gabungkan kembali tanpa mengubah path
                return `${proto}${obfuscatedDomain}${path || ""}`;
            },
        );
    };

    processUpload = async (filePath, reqData) => {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = xlsx.utils.sheet_to_json(worksheet, {
                range: 1,
                defval: "",
            });

            for await (const row of jsonData) {
                await messageModel.insert({
                    user_id: reqData.user_id,
                    destination: row.handphone,
                    content: row.message,
                });
            }

            // Hapus file setelah dibaca
            fs.unlinkSync(filePath);
            return jsonData;
        } catch (error) {
            throw new CustomError(
                "Gagal membaca file Excel: " + error.message,
                400,
            );
        }
    };

    processSendBulkMessage = async (reqBody, reqData) => {
        const checkTemp = await messageModel.findAll(1, 1000, reqData.user_id);
        if (!checkTemp.total === 0) {
            throw new CustomError("Data Kosong", 400);
        }

        const checkSenderName = await routingModel.checkSenderName(
            reqBody.sender_name,
        );
        const routing = checkSenderName.rows;
        if (routing.length == 0) {
            throw new CustomError("Maaf, Sender tidak ditemukan", 400);
        }

        for await (const row of checkTemp.result) {
            let description =
                routing[0].footer_id == null
                    ? row.content
                    : `${row.content} ${routing[0].content}`;
            const insertTransaction = await transactionModel.insert({
                user_id: row.user_id,
                sender_name: reqBody.sender_name,
                destination: row.destination,
                content: description,
            });
            if (insertTransaction) {
                /* await queueInitSender.add("processing_data", {
                    transaction_id: insertTransaction.id_transaction,
                    delayMaxDefault: null,
                }); */
                await messageModel.delete(row.id);
            }
        }

        return checkTemp;
    };

    getDataMessageTemps = async (reqBody) => {
        const messageTemp = await messageModel.findAll(
            1,
            1000,
            reqBody.user_id,
        );
        if (!messageTemp) throw new CustomError("Data Not Found", 404);
        return messageTemp;
    };
}

module.exports = new messageService();
