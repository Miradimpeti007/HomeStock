/**
 * @module ipc/history.ipc
 * @description Enregistrement des canaux IPC pour l'historique de consommation.
 * Ce module permet au processus de rendu de consulter et de gérer les archives (consommé/jeté).
 */
const { ipcMain } = require('electron');
const historyHandler = require('../handlers/history.handler');

/**
 * @description Initialise les écouteurs IPC pour le module Historique.
 */
function registerHistoryIpc() {
    // Récupération de l'historique avec filtres (date, statut, catégorie) et pagination
    ipcMain.handle('history:getAll', historyHandler.getAllHistory);

    // Suppression d'une entrée spécifique de l'historique
    ipcMain.handle('history:deleteItem', historyHandler.deleteHistoryItem);

    // Suppression totale de l'historique (Remise à zéro)
    ipcMain.handle('history:clear', historyHandler.clearHistory);
}

module.exports = {
    registerHistoryIpc
};