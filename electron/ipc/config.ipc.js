/**
 * @description Enregistrement des canaux IPC pour la configuration.
 * Relie les appels du moteur de rendu aux méthodes du configHandler.
 */
const { ipcMain } = require('electron');
const configHandler = require('../handlers/config.handler');

function registerConfigIpc() {
    // Catégories
    ipcMain.handle('categories:getAll', configHandler.getAllCategories);

    // Emplacements (Locations)
    ipcMain.handle('locations:getAll', configHandler.getAllLocations);
    ipcMain.handle('locations:create', configHandler.createLocation);
    ipcMain.handle('locations:update', configHandler.updateLocation);
    ipcMain.handle('locations:delete', configHandler.deleteLocation);
}

// N'oublie pas d'appeler registerConfigIpc() dans ta fonction principale d'initialisation !
module.exports = { registerConfigIpc, /* ... tes autres exports */ };