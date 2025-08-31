class CustomError extends Error {
    constructor(message, statusCode = 400, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.data = data; // Optional: Additional data for debugging or response
    }
}

module.exports = CustomError;
