function toPostgresTimestamp(dateInput = new Date()) {
    // UTC+7 offset (Jakarta)
    const offsetMs = 7 * 60 * 60 * 1000;
    const localDate = new Date(dateInput.getTime() + offsetMs);

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = localDate.getUTCFullYear();
    const MM = pad(localDate.getUTCMonth() + 1);
    const dd = pad(localDate.getUTCDate());
    const HH = pad(localDate.getUTCHours());
    const mm = pad(localDate.getUTCMinutes());
    const ss = pad(localDate.getUTCSeconds());

    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}

module.exports = { toPostgresTimestamp };
