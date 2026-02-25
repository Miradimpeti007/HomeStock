/**
 * @module product.ipc
 * @description IPC channels registration for Products.
 */
const { ipcMain } = require('electron');
const productHandler = require('../handlers/product.handler');

function registerProductIpc() {
    ipcMain.handle('products:getAll', productHandler.getAllProducts);
    ipcMain.handle('products:create', productHandler.createProduct);
    ipcMain.handle('products:delete', productHandler.deleteProduct);
}

module.exports = {
    registerProductIpc
};