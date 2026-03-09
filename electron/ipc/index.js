/**
 * @module ipc/index
 * @description Centralizes all IPC registrations to keep main.js clean.
 */
<<<<<<< HEAD
// const { registerCategoryIpc } = require('./category.ipc');
const { registerProductIpc } = require('./product.ipc');

function registerAllIpc() {
    // registerCategoryIpc();
=======
const { registerCategoryIpc } = require('./category.ipc');


function registerAllIpc() {
    registerCategoryIpc();
>>>>>>> walidTest
    registerProductIpc();
}

module.exports = {
    registerAllIpc
};