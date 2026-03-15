/**
 * @module ipc/config.ipc
 * @description Enregistrement des canaux IPC pour la configuration globale.
 * Relie les appels du processus de rendu aux méthodes du configHandler.
 */
const { ipcMain } = require('electron');
const configHandler = require('../handlers/config.handler');

/**
 * @description Définit les handles pour les catégories et les emplacements.
 */
function registerConfigIpc() {
    /**
     * @section Canaux pour les Catégories
     */
    ipcMain.handle('categories:getAll', configHandler.getAllCategories);
    ipcMain.handle('categories:create', configHandler.createCategory);
    ipcMain.handle('categories:update', configHandler.updateCategory);
    ipcMain.handle('categories:delete', configHandler.deleteCategory);

    /**
     * @section Canaux pour les Emplacements (Locations)
     */
    ipcMain.handle('locations:getAll', configHandler.getAllLocations);
    ipcMain.handle('locations:create', configHandler.createLocation);
    ipcMain.handle('locations:update', configHandler.updateLocation);
    ipcMain.handle('locations:delete', configHandler.deleteLocation);
}

module.exports = { 
    registerConfigIpc 
};