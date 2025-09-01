const { DateTime } = require("luxon");

const TIME_ZONE = "Asia/Jakarta";

function nowJakarta() {
    return DateTime.now().setZone(TIME_ZONE);
}

function nowJakartaStr(formatStr = "yyyy-MM-dd HH:mm:ss") {
    return nowJakarta().toFormat(formatStr);
}

function overrideGlobalDate() {
    const OriginalDate = Date; // simpan reference sebelum override

    global.Date = class extends OriginalDate {
        constructor(...args) {
            if (args.length === 0) {
                // gunakan OriginalDate agar tidak memicu loop
                const now = new OriginalDate();
                return DateTime.fromJSDate(now).setZone(TIME_ZONE).toJSDate();
            } else {
                return new OriginalDate(...args);
            }
        }

        static now() {
            // gunakan OriginalDate agar tidak memicu loop
            const now = new OriginalDate();
            return DateTime.fromJSDate(now).setZone(TIME_ZONE).toMillis();
        }
    };
}

module.exports = {
    nowJakarta,
    nowJakartaStr,
    overrideGlobalDate,
};
