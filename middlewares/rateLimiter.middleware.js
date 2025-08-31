const rateLimit = require("express-rate-limit");

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 80, // max 120 request per IP
    message: {
        message: "Terlalu banyak request, coba lagi dalam 1 menit.",
        errors: null,
    },
    standardHeaders: true, // RateLimit-* headers
    legacyHeaders: false,
});
