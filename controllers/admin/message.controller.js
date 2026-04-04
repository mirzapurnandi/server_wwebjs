const messageService = require("../../services/message.service");
const responseHandler = require("../../utils/responseHandler");
const { queueWarmup } = require("../../config/queueBullMQ");

class messageController {
    sendMessage = async (req, res, next) => {
        try {
            const result = await messageService.processSendMessage(req.body, {
                user_id: req.body.user_id,
                email: req.user.email,
            });
            return responseHandler.success(
                res,
                "successfully Send Message",
                result,
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    sendMessageMedia = async (req, res, next) => {
        try {
            const result = await messageService.processSendMessage(
                req.body,
                {
                    user_id: req.body.user_id,
                    email: req.user.email,
                },
                "media",
            );
            return responseHandler.success(
                res,
                "successfully Send Message",
                result,
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    sendMessageBack = async (req, res, next) => {
        try {
            const result = await messageService.sendMessage(
                req.body.transaction_id,
            );
            return responseHandler.success(
                res,
                "successfully Send Message",
                result,
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    uploadFile = async (req, res, next) => {
        try {
            if (!req.file) {
                return responseHandler.error(res, "File tidak ditemukan", null);
            }
            const result = await messageService.processUpload(req.file.path, {
                user_id: req.body.user_id,
            });

            return responseHandler.success(
                res,
                "successfully Upload File",
                result,
            );
        } catch (error) {
            next(error);
        }
    };

    uploadFileSend = async (req, res, next) => {
        try {
            const result = await messageService.processSendBulkMessage(
                req.body,
                { user_id: req.body.user_id },
            );
            return responseHandler.success(
                res,
                "successfully Send Bulk Message",
                result,
            );
        } catch (error) {
            next(error);
        }
    };

    getMessageTemp = async (req, res, next) => {
        try {
            const result = await messageService.getDataMessageTemps(req.body);
            return responseHandler.success(
                res,
                "successfully Get Data Message Temporary",
                result,
            );
        } catch (error) {
            next(error);
        }
    };

    triggerWarmup = async (req, res, next) => {
        try {
            const { id_instance, destination } = req.body; // Ini adalah initiator (nomor_1)

            if (!id_instance || !destination) {
                return responseHandler.error(
                    res,
                    "id_instance dan destination diperlukan",
                    null,
                    400,
                );
            }

            await queueWarmup.add("start_warmup", {
                initiator_id: id_instance,
                destination_hp: destination,
            });

            return responseHandler.success(
                res,
                "Skenario Auto-Warmup berhasil dijadwalkan di Background Job.",
                {
                    initiator: id_instance,
                    destination: destination,
                },
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    };
}

module.exports = new messageController();
