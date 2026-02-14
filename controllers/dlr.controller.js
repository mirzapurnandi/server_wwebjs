const providerDetail = require("../models/providerDetail.model");
const transactionModel = require("../models/transaction.model");
const inboxModel = require("../models/inbox.model");
const authModel = require("../models/auth.model");
const { queueWebhook } = require("../config/queueBullMQ");
const chatbotService = require("../services/chatbot.service");

class dlrController {
    process = async (req, res) => {
        try {
            const { id_instance, type, state, data } = req.body;
            let message = "";
            let error = true;
            let datas = [];
            let label = state;
            switch (type) {
                case "INSTANCE":
                    let is_active = false;
                    if (state === "READY" || state === "CONNECTED") {
                        is_active = true;
                    }

                    await providerDetail.update(
                        id_instance,
                        {
                            label,
                            is_active,
                        },
                        "license_key",
                    );

                    if (state === "DISCONNECT" || state === "BANNED") {
                        console.log(
                            `[CLEANUP] Instance ${id_instance} died. Cleaning pending transactions...`,
                        );

                        // A. Cari semua transaksi yang masih menggantung di instance ini
                        const pendingTransactions =
                            await transactionModel.findPendingByInstance(
                                id_instance,
                            );

                        // B. Loop setiap transaksi untuk dimatikan & kirim webhook
                        if (pendingTransactions.length > 0) {
                            for (const trx of pendingTransactions) {
                                // 1. Update DB ke status Failed/Stopped
                                await transactionModel.update(
                                    trx.id_transaction,
                                    {
                                        status_code: 2, // 2 = Failed
                                        message_status: "STOPPED_INSTANCE_DIED",
                                    },
                                );

                                // 2. Kirim Webhook "Failed" ke User
                                const checkUserPrivate =
                                    await authModel.checkUserPrivate(
                                        trx.user_id,
                                        null,
                                        "intern",
                                    );

                                if (
                                    checkUserPrivate?.method &&
                                    checkUserPrivate?.url
                                ) {
                                    queueWebhook.add("send_webhook", {
                                        transaction_id: trx.id_transaction,
                                        status: "failed",
                                        details:
                                            "Sender disconnected/banned before delivery confirmation",
                                        method: checkUserPrivate.method,
                                        url: checkUserPrivate.url,
                                    });
                                }
                            }
                            message = `Instance Disconnect. ${pendingTransactions.length} pending transactions terminated.`;
                        } else {
                            message =
                                "Instance Disconnect. No pending transactions found.";
                        }
                    } else {
                        message = "Successfully Active Instance";
                    }
                    /* if (update) {
                        message = "successfully Active Instance";
                        error = false;
                        datas = update.rows[0];
                    } */
                    break;
                case "DLR":
                    const result = await transactionModel.findByMessageID(
                        data.id,
                    );
                    let checkUserPrivate,
                        sendWebhook = false;
                    if (result) {
                        checkUserPrivate = await authModel.checkUserPrivate(
                            result.user_id,
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
                    }

                    let notes;
                    if (data.ack == 1) {
                        notes = "time_send";
                        if (sendWebhook) {
                            queueWebhook.add("send_webhook", {
                                transaction_id: result.id_transaction,
                                status: "delivered",
                                method: checkUserPrivate.method,
                                url: checkUserPrivate.url,
                            });
                        }
                    } else if (data.ack == 2) {
                        notes = "time_receive";
                        if (sendWebhook) {
                            queueWebhook.add("send_webhook", {
                                transaction_id: result.id_transaction,
                                status: "delivered",
                                method: checkUserPrivate.method,
                                url: checkUserPrivate.url,
                            });
                        }
                    } else if (data.ack == 3) {
                        notes = "time_read";
                        if (sendWebhook) {
                            queueWebhook.add("send_webhook", {
                                transaction_id: result.id_transaction,
                                status: "read",
                                method: checkUserPrivate.method,
                                url: checkUserPrivate.url,
                            });
                        }
                    }
                    await transactionModel.updateDate(
                        { message_id: data.id, license_key: id_instance },
                        notes,
                    );

                    break;
                case "INBOX_MESSAGE":
                    await inboxModel.insert(data, id_instance);
                    await chatbotService
                        .handleSapaLocal(data, id_instance)
                        .catch((err) => {
                            console.error("Chatbot Service Error:", err);
                        });
                    break;
                case "TRANSACTION_FAILED":
                    const failedTrx = await transactionModel.findByID(
                        data.id_transaction,
                    );
                    message = `Transaction ID ${data.id_transaction} not found.`;
                    if (failedTrx) {
                        await transactionModel.update(
                            failedTrx.id_transaction,
                            {
                                status_code: 2,
                                message_status:
                                    data.error_detail ||
                                    "ENGINE_TRANSACTION_FAILED",
                            },
                        );

                        const userConfig = await authModel.checkUserPrivate(
                            failedTrx.user_id,
                            null,
                            "intern",
                        );

                        if (userConfig?.method && userConfig?.url) {
                            queueWebhook.add("send_webhook", {
                                transaction_id: failedTrx.id_transaction,
                                status: "failed",
                                details:
                                    data.error_detail ||
                                    "Transaction failed due to instance issues",
                                method: userConfig.method,
                                url: userConfig.url,
                            });
                        }
                        message = `Transaction ${data.id_transaction} marked as failed.`;
                        error = false;
                    }
                    break;
            }

            return res.status(200).json({
                error: error,
                message: message,
                data: datas,
            });
        } catch (error) {
            return res.status(401).send({
                message: error.message,
            });
        }

        /* return res.status(404).send({
            message: "not Found",
        }); */
    };
}

module.exports = new dlrController();
