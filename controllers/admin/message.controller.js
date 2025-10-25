const messageService = require("../../services/message.service");
const responseHandler = require("../../utils/responseHandler");

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
                result
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
                "media"
            );
            return responseHandler.success(
                res,
                "successfully Send Message",
                result
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    sendMessageBack = async (req, res, next) => {
        try {
            const result = await messageService.sendMessage(
                req.body.transaction_id
            );
            return responseHandler.success(
                res,
                "successfully Send Message",
                result
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
                result
            );
        } catch (error) {
            next(error);
        }
    };

    uploadFileSend = async (req, res, next) => {
        try {
            const result = await messageService.processSendBulkMessage(
                req.body,
                { user_id: req.body.user_id }
            );
            return responseHandler.success(
                res,
                "successfully Send Bulk Message",
                result
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
                result
            );
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new messageController();
