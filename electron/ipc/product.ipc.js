/**
 * @module ipc/product.ipc
 * @description Enregistrement des canaux IPC pour la gestion des produits.
 * Ce module expose les fonctionnalités CRUD et de gestion des stocks au processus de rendu.
 */
const { ipcMain } = require('electron');
const productHandler = require('../handlers/product.handler');


/**
 * @description Initialise les écouteurs IPC pour le module Produits.
 * Chaque canal correspond à une action spécifique du cycle de vie des produits.
 */
function registerProductIpc() {
    // Récupération avec filtres et pagination
    ipcMain.handle('products:getAll', productHandler.getAllProducts);

    // Création d'un nouveau produit avec validation complète
    ipcMain.handle('products:create', productHandler.createProduct);

    // Mise à jour complète (mode édition)
    ipcMain.handle('products:update', productHandler.updateProduct);

    // Ajustement rapide des quantités et seuils d'alerte
    ipcMain.handle('products:updateQty', productHandler.updateQuantity);

    // Suppression avec archivage obligatoire
    ipcMain.handle('products:delete', productHandler.deleteProduct);
}

module.exports = {
    registerProductIpc
};