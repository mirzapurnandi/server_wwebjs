const messageService = require("../services/message.service");
const transactionService = require("../services/transaction.service");
const responseHandler = require("../utils/responseHandler");
const statusTransaction = require("../enums/statusTransaction");

class privateController {
    sendMessage = async (req, res, next) => {
        try {
            const typeMedia = req.body.file_url ? "media" : "text";
            const result = await messageService.processSendMessage(
                req.body,
                {
                    user_id: req.user.id,
                    email: req.user.email,
                },
                typeMedia,
                "privated"
            );
            return responseHandler.success(res, "successfully Send Message", {
                id_transaction: result.id_transaction,
                messageid: result.messageid,
                sender_name: result.sender_name,
                destination: result.destination,
                content: result.content,
                image: result.image,
                price: result.price,
                status: Object.keys(statusTransaction).find(
                    (key) =>
                        statusTransaction[key] === parseInt(result.status_code)
                ),
                time_send: result.time_send,
                time_receive: result.time_receive,
                time_read: result.time_read,
                created_at: result.created_at,
            });
        } catch (error) {
            next(error);
        }
    };

    checkMessage = async (req, res, next) => {
        try {
            const idTransaction = req.params.id_transaction ?? null;
            const result = await transactionService.getDataTransaction(
                idTransaction,
                req.user.id
            );

            return responseHandler.success(
                res,
                "successfully get Data Transaction",
                {
                    id_transaction: result.id_transaction,
                    messageid: result.messageid,
                    sender_name: result.sender_name,
                    destination: result.destination,
                    content: result.content,
                    image: result.image,
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
}

module.exports = new privateController();
