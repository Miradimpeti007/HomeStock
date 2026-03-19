const { ipcMain } = require('electron');
const settingsHandler = require('../handlers/settings.handler');

/**
 * @module ipc/settings.ipc
 * @description Registers IPC handlers for application settings.
 */
function registerSettingsIpc() {
    // Retrieves all settings (used at app launch)
    ipcMain.handle('settings:get-all', settingsHandler.getAllSettings);
    
    // Updates a single setting
    ipcMain.handle('settings:update', settingsHandler.updateSetting);
}

module.exports = {
    registerSettingsIpc
};