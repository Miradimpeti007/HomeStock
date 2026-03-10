/**
 * @module ipc/index
 * @description Centralizes all IPC registrations to keep main.js clean.
 */
// const { registerCategoryIpc } = require('./category.ipc');
const { registerProductIpc } = require('./product.ipc');

function registerAllIpc() {
    // registerCategoryIpc();
    registerProductIpc();
}

module.exports = {
    registerAllIpc
};