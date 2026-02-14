// message-generator.js
// Node.js (no external deps) — Spintax + randomizer + batch generator
// Usage examples at bottom

const BASE_REKENING_URL = "baznas.go.id/rekening";

/**
 * Parse spintax recursively.
 * Example: "Hello {A|B}" -> randomly "Hello A" or "Hello B"
 */
function parseSpintax(text) {
    // find the first balanced { ... } pair
    const rx = /\{([^{}]+)\}/;
    let out = text;

    while (rx.test(out)) {
        out = out.replace(rx, (_, group) => {
            const parts = group
                .split("|")
                .map((s) => s.trim())
                .filter((s) => s.length);
            if (parts.length === 0) return "";
            const pick = parts[Math.floor(Math.random() * parts.length)];
            return pick;
        });
    }
    return out;
}

/**
 * Simple template replacer for {{name}} and other placeholders
 */
function applyPlaceholders(text, vars = {}) {
    return text.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
        if (vars[key] === undefined || vars[key] === null) return "";
        return String(vars[key]);
    });
}

/**
 * Pre-defined spintax templates.
 * You can extend these arrays or load from DB/files.
 */
const TEMPLATES = {
    short: [
        "{Assalamu'alaikum|Assalamualaikum|Assalamu'alaikum wr. wb.},\n\nKami membagikan {informasi|pembaruan} rekening resmi BAZNAS (lihat lampiran).\n\nRek lengkap: " +
            BASE_REKENING_URL +
            "\n\nSTOP = berhenti info",
        "Assalamu’alaikum,\nInfo rekening resmi BAZNAS ada pada gambar terlampir.\nDetail: " +
            BASE_REKENING_URL +
            "\nBalas STOP untuk berhenti",
    ],
    info: [
        "{Assalamu'alaikum|Assalamualaikum|Assalamu'alaikum wr. wb.},\n\nKami {menyampaikan|mengirimkan} {informasi|pembaruan} terkait {daftar rekening resmi BAZNAS|nomor rekening zakat BAZNAS} {yang terlampir|pada gambar}.\n\nRekening dapat digunakan untuk penunaian Zakat Maal sesuai ketentuan syariah.\n\nUntuk daftar lainnya: " +
            BASE_REKENING_URL +
            "\n\nBalas STOP jika ingin berhenti menerima info.",
        "{Assalamu'alaikum|Assalamualaikum|Assalamu'alaikum wr. wb.},\nKami dari BAZNAS menyampaikan informasi rekening resmi (terlampir). Silakan cek " +
            BASE_REKENING_URL +
            " untuk daftar lengkap.\n\nBalas STOP bila ingin berhenti menerima pesan.",
    ],
    formal: [
        "{Assalamu'alaikum|Assalamualaikum|Assalamu'alaikum wr. wb.},\n\nKami dari BAZNAS ingin {memberikan|menyampaikan} informasi resmi terkait daftar rekening BAZNAS {yang terlampir|pada gambar terlampir}.\nInformasi lain tersedia di: " +
            BASE_REKENING_URL +
            "\n\nBalas STOP untuk berhenti menerima informasi.",
        "Assalamu'alaikum,\n\nSebagai bagian dari layanan informasi BAZNAS, kami mengirimkan pembaruan nomor rekening resmi (lihat lampiran). Untuk berhenti menerima informasi ini, ketik STOP.",
    ],
};

/**
 * Optionally include image note (if you're sending via WA you can attach image separately)
 * This function just appends a short note about the attachment.
 */
function attachImageNote(message, opts = {}) {
    if (!opts.includeImage) return message;
    const note = opts.imageUrl
        ? `\n\n(Gambar terlampir: ${opts.imageUrl})`
        : "\n\n(Gambar terlampir)";
    return message + note;
}

/**
 * Generate a single message
 * opts: { mode: 'short'|'info'|'formal', name: string|null, includeImage: bool, imageUrl: string|null }
 */
function generateMessage(opts = {}) {
    const mode = opts.mode || "info";
    const pool = TEMPLATES[mode] || TEMPLATES.info;
    const template = pool[Math.floor(Math.random() * pool.length)];

    // first expand spintax (random choices inside {}), then apply placeholders
    const expanded = parseSpintax(template);
    const withPlaceholders = applyPlaceholders(expanded, {
        name: opts.name || "",
    });
    const withImage = attachImageNote(withPlaceholders, opts);

    // normalize whitespace a bit
    return withImage.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Generate batch of messages (tries to make them unique)
 * count: how many messages
 * opts same as generateMessage
 */
function generateBatch(count = 10, opts = {}) {
    const out = new Set();
    const maxAttempts = Math.max(count * 10, 200);

    let attempts = 0;
    while (out.size < count && attempts < maxAttempts) {
        out.add(generateMessage(opts));
        attempts++;
    }

    return Array.from(out);
}

/* --------------------------
   CLI usage when run directly
   e.g. node message-generator.js 5 info "Budi" https://example.com/img.jpg
   -------------------------- */
if (require.main === module) {
    const argv = process.argv.slice(2);
    const count = parseInt(argv[0] || "1", 10);
    const mode = argv[1] || "info";
    const name = argv[2] || "";
    const imageUrl = argv[3] || "";
    const includeImage = !!imageUrl;

    const batch = generateBatch(count, { mode, name, includeImage, imageUrl });
    batch.forEach((m, i) => {
        console.log("---- MESSAGE", i + 1, "----");
        console.log(m);
        console.log();
    });
}

// Exports for integration
module.exports = {
    parseSpintax,
    applyPlaceholders,
    generateMessage,
    generateBatch,
    TEMPLATES,
    BASE_REKENING_URL,
};
