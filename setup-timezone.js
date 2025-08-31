import { utcToZonedTime, format } from "date-fns-tz";

const timeZone = "Asia/Jakarta";

// backup original Date
const OriginalDate = Date;

// override global Date
global.Date = class extends OriginalDate {
    constructor(...args) {
        if (args.length === 0) {
            // tanpa argumen → pakai timezone Jakarta
            const nowUtc = new OriginalDate();
            const jakartaTime = utcToZonedTime(nowUtc, timeZone);
            return jakartaTime;
        } else {
            // kalau ada argumen → normal
            return new OriginalDate(...args);
        }
    }

    static now() {
        const nowUtc = OriginalDate.now();
        return utcToZonedTime(new OriginalDate(nowUtc), timeZone).getTime();
    }
};
