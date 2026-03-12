/**
 * @module ipc/index
 * @description Centralizes all IPC registrations to keep main.js clean.
 */

const { registerProductIpc } = require('./product.ipc');
const { registerConfigIpc } = require('./config.ipc');
const { registerHistoryIpc } = require('./history.ipc');

function registerAllIpc() {
    registerProductIpc();
    registerConfigIpc();
    registerHistoryIpc();
}

module.exports = {
    registerAllIpc
};