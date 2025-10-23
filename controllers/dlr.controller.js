const providerDetail = require("../models/providerDetail.model");
const transactionModel = require("../models/transaction.model");
const inboxModel = require("../models/inbox.model");
const authModel = require("../models/auth.model");
const { queueWebhook } = require("../config/queueBullMQ");

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

                    const update = await providerDetail.update(
                        id_instance,
                        {
                            label,
                            is_active,
                        },
                        "license_key"
                    );
                    if (update) {
                        message = "successfully Active Instance";
                        error = false;
                        datas = update.rows[0];
                    }
                    break;
                case "DLR":
                    const result = await transactionModel.findByMessageID(
                        data.id
                    );
                    let checkUserPrivate,
                        sendWebhook = false;
                    if (result) {
                        checkUserPrivate = await authModel.checkUserPrivate(
                            result.user_id,
                            null,
                            "intern"
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
                        notes
                    );

                    break;
                case "INBOX_MESSAGE":
                    await inboxModel.insert(data, id_instance);
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
