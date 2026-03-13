/**
 * @module ipc/shopping.ipc
 * @description Enregistrement des canaux IPC pour la gestion de la liste de courses.
 * Permet au processus de rendu de manipuler le panier et de synchroniser les stocks.
 */
const { ipcMain } = require('electron');
const shoppingHandler = require('../handlers/shopping.handler');

/**
 * @description Initialise les écouteurs IPC pour le module Shopping.
 */
function registerShoppingIpc() {
    // Récupération de la liste (supporte les filtres optionnels)
    ipcMain.handle('shopping:get-list', shoppingHandler.getShoppingList);

    // Ajout d'un nouvel article (catégorie générique par défaut via le handler)
    ipcMain.handle('shopping:add-item', shoppingHandler.addShoppingItem);

    // Mise à jour de la quantité (restriction stricte définie dans le handler)
    ipcMain.handle('shopping:update-qty', shoppingHandler.updateShoppingQuantity);

    // Changement d'état coché/décoché (isCompleted)
    ipcMain.handle('shopping:toggle-completion', shoppingHandler.toggleItemCompletion);

    // Suppression d'un article spécifique par son identifiant
    ipcMain.handle('shopping:delete-item', shoppingHandler.deleteShoppingItem);

    // Vidage complet de la liste de courses
    ipcMain.handle('shopping:clear-all', shoppingHandler.clearAllShoppingItems);

    // Validation du panier et synchronisation avec l'inventaire des produits
    ipcMain.handle('shopping:validate-cart', shoppingHandler.validateCartToInventory);
}

module.exports = {
    registerShoppingIpc
};