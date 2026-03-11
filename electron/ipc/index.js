/**
 * @module ipc/index
 * @description Centralizes all IPC registrations to keep main.js clean.
 */
// const { registerCategoryIpc } = require('./category.ipc');
const { registerProductIpc } = require('./product.ipc');
const { registerConfigIpc } = require('./config.ipc');

function registerAllIpc() {
    // registerCategoryIpc();
    registerProductIpc();
    registerConfigIpc();
}

module.exports = {
    registerAllIpc
};