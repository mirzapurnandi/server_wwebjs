const routingModel = require("../../models/routing.model");
const { differenceInSeconds } = require("date-fns");
const moment = require("moment-timezone");

class defaultService {
    processSettingDelay = async (getTransaction, dateNow) => {
        const getSender = await routingModel.getSender(
            getTransaction.user_id,
            getTransaction.sender_name,
            "DESC"
        );

        if (getSender && getSender.used_at !== null) {
            const secondDelay = (
                parseInt(getSender.delay) / parseInt(getSender.count)
            ).toFixed(2);

            const usedAt = moment(getSender.used_at).tz("Asia/Jakarta");
            let selisih = differenceInSeconds(usedAt, dateNow);
            const result = parseInt(selisih) + parseFloat(secondDelay);
            if (result >= 0) return result;
        }
        return null;
    };
}

module.exports = defaultService;
