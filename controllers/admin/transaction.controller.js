const transactionService = require("../../services/transaction.service");
const responseHandler = require("../../utils/responseHandler");
const statusTransaction = require("../../enums/statusTransaction");
const messageService = require("../../services/message.service");

class transactionController {
    getAll = async (req, res, next) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 50;
            const userID = req.query.user_id;
            const senderName = req.query.sender_name;
            const statusCode = req.query.status_code || "";

            const result = await transactionService.getAllData({
                page: parseInt(page),
                user_id: userID,
                sender_name: senderName,
                status_code: statusCode,
                limit: parseInt(limit),
            });

            return responseHandler.success(
                res,
                "successfully show All Transaction",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const idTransaction = req.query.id_transaction ?? null;
            const userID = req.query.user_id ?? null;
            const result = await transactionService.getDataTransaction(
                idTransaction,
                userID
            );

            return responseHandler.success(
                res,
                "successfully get Detail Transaction",
                {
                    id_transaction: result.id_transaction,
                    messageid: result.messageid,
                    sender_name: result.sender_name,
                    destination: result.destination,
                    content: result.content,
                    price: result.price,
                    status: Object.keys(statusTransaction).find(
                        (key) =>
                            statusTransaction[key] ===
                            parseInt(result.status_code)
                    ),
                    time_send: result.time_send,
                    time_receive: result.time_receive,
                    time_read: result.time_read,
                    created_at: result.created_at,
                }
            );
        } catch (error) {
            next(error);
        }
    };

    trySend = async (req, res, next) => {
        try {
            const idTransaction = req.body.id_transaction;
            const result = await messageService.processGetSender(idTransaction);
            if (!result) {
                return responseHandler.error(res, "Data Not Found", null, 404);
            }

            return responseHandler.success(
                res,
                "successfully trySend Transaction",
                result
            );
        } catch (error) {
            next(error);
        }
    };

    getAllByFilter = async (req, res, next) => {
        try {
            const statusCode = req.query.status_code;
            const date = req.query.date;
            const senderName = req.query.sender_name;
            const limit = req.query.limit || 25;
            const type = req.query.type || null;
            const crack = req.query.crack || null;

            const result = await transactionService.filterDataTransaction({
                date: date,
                sender_name: senderName,
                status_code: statusCode,
                limit: parseInt(limit),
                type: type,
                crack: crack,
            });

            return responseHandler.success(
                res,
                "successfully show All Transaction by Filter",
                result
            );
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new transactionController();
