/**
 * @module ipc/index
 * @description Centralizes all IPC registrations to keep main.js clean.
 */

const { registerProductIpc } = require('./product.ipc');
const { registerConfigIpc } = require('./config.ipc');
const { registerHistoryIpc } = require('./history.ipc');
const {registerShoppingIpc} = require('./shopping.ipc');
const { registerSettingsIpc } = require('./settings.ipc');

function registerAllIpc() {
    registerProductIpc();
    registerConfigIpc();
    registerHistoryIpc();
    registerShoppingIpc();
    registerSettingsIpc();
}

module.exports = {
    registerAllIpc
};