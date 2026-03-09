/**
 * @module utils/response.util
 * @description Centralizes IPC response formatting and persists errors to disk via electron-log.
 */
const log = require('electron-log');

class ResponseHandler {
    
    /**
     * Formats a successful operation response.
     * @static
     * @param {any} [data=null] - The payload to return to the frontend.
     * @returns {Object} Standardized success object.
     */
    static success(data = null) {
        return {
            success: true,
            data: data
        };
    }

    /**
     * Logs the error to disk and formats a standardized error response.
     * @static
     * @param {Error|any} rawError - The original error object for logging.
     * @param {string} errorType - Technical code for the error.
     * @param {string} message - User-friendly message for the UI.
     * @returns {Object} Standardized error object.
     */
    static error(rawError, errorType, message) {
        // Automatically adds timestamp, severity level [error], and stack trace to the log file.
        log.error(`[${errorType}] ${message}`, rawError);

        return {
            success: false,
            errorType: errorType,
            message: message
        };
    }
}

module.exports = ResponseHandler;