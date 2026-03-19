const { Notification } = require('electron');
const path = require('path');

/**
 * @module services/notification.service
 * @description Gère l'affichage des notifications natives du système.
 */
class NotificationService {
  /**
   * Envoie une notification système.
   * @param {string} title - Le titre de l'alerte.
   * @param {string} body - Le corps du message.
   * @param {string} [icon] - Chemin optionnel vers une icône.
   */
  static send(title, body, icon) {
    const notification = new Notification({
      title,
      body,
      silent: false,
      timeoutType: 'never', // Garde l'alerte visible selon l'OS
      icon: icon || path.join(__dirname, '..', '..', 'assets', 'appLogo.png')
    });

    notification.show();

    // Optionnel : Gérer le clic pour ramener la fenêtre au premier plan
    notification.on('click', () => {
      
        const { BrowserWindow } = require('electron');
        const win = BrowserWindow.getAllWindows()[0]; 

        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();

            
            win.webContents.send('open-alerts-modal', body);
        }
    });
  }
}

module.exports = NotificationService;