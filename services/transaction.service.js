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

    sendDataTransaction = async (idTransaction, status, method, url) => {
        try {
            const checkTransaction = await this.getDataTransaction(
                idTransaction
            );
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
                status: status.toUpperCase(),
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
            if (method.toUpperCase() === "POST") {
                await axios.post(url, data, {
                    headers: { "Content-Type": "application/json" },
                });
            } else if (method.toUpperCase() === "GET") {
                await axios.get(url, { params: data });
            }

            logger.info(
                `✅ Axios Result: ${
                    data.status
                } [${method.toUpperCase()}] ${url}`
            );
        } catch (error) {
            if (error.response) {
                console.error(
                    "❌ Axios Response Error:",
                    error.response.status,
                    error.response.data
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
