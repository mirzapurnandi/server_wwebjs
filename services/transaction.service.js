const defaultService = require("./extends/default.service");
const transactionModel = require("../models/transaction.model");
const authModel = require("../models/auth.model");
const axios = require("axios");
const logger = require("../utils/logger");
const CustomError = require("../helpers/customError");

class transactionService extends defaultService {
    getDataTransaction = async (idTransaction, userID) => {
        const getTransaction = await transactionModel.findByID(
            idTransaction,
            userID
        );
        if (!getTransaction) throw new CustomError("Data Not Found", 404);

        return getTransaction;
    };

    sendDataTransaction = async (idTransaction, status = "failed") => {
        const checkTransaction = await this.getDataTransaction(idTransaction);
        if (checkTransaction) {
            const checkUserPrivate = await authModel.checkUserPrivate(
                checkTransaction.user_id,
                null,
                "intern"
            );
            if (
                checkUserPrivate &&
                checkUserPrivate.method != null &&
                checkUserPrivate.url != null
            ) {
                await this.sendDataAxios(
                    checkUserPrivate.method,
                    checkUserPrivate.url,
                    {
                        id_transaction: checkTransaction.id_transaction,
                        messageid: checkTransaction.messageid,
                        sender_name: checkTransaction.sender_name,
                        destination: checkTransaction.destination,
                        content: checkTransaction.content,
                        price: checkTransaction.price,
                        status: status.toUpperCase(),
                        time_send: checkTransaction.time_send,
                        time_receive: checkTransaction.time_receive,
                        time_read: checkTransaction.time_read,
                        created_at: checkTransaction.created_at,
                    }
                );
            }
        }
    };

    sendDataAxios = async (method, url, data) => {
        try {
            if (method.toUpperCase() === "POST") {
                await axios.post(url, data, {
                    headers: { "Content-Type": "application/json" },
                });
            } else if (method.toUpperCase() === "GET") {
                await axios.get(url, { params: data });
            }

            logger.info(
                `Axios Result: ${data.status} [${method.toUpperCase()}] ${url}`
            );
        } catch (error) {
            logger.error(`Axios Error: ${error.message}`);
        }
    };
}

module.exports = new transactionService();
