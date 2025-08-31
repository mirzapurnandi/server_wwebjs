const responseHandler = {
    /**
     * Send a success response
     * @param {import("express").Response} res - Express response object
     * @param {string} message - Response message
     * @param {any} [data=null] - Data to be sent in response
     * @param {number} [statusCode=200] - HTTP status code
     */
    success: (res, message, data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            message: message,
            result: data,
        });
    },

    /**
     * Send an error response
     * @param {import("express").Response} res - Express response object
     * @param {string} message - Error message
     * @param {any} [error=null] - Error details
     * @param {number} [statusCode=400] - HTTP status code
     */
    error: (res, message, error = null, statusCode = 400) => {
        return res.status(statusCode).json({
            message: message,
            errors: error,
        });
    },
};

module.exports = responseHandler;
