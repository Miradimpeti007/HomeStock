const { Tray, Menu, app } = require('electron');
const path = require('path');
const WatcherService = require('./watcher.service');

/**
 * @module services/tray.service
 * @description Gère l'icône de la zone de notification (System Tray) et son menu contextuel.
 */
class TrayService {
    constructor() {
        this.tray = null;
    }

    /**
     * Initialise le Tray avec l'icône et le menu.
     * @param {BrowserWindow} mainWindow - Référence à la fenêtre principale pour le contrôle d'affichage.
     */
    init(mainWindow) {
        console.log('[TRAY SERVICE] Initialisation du Tray...');

        // Utilisation de l'icône de l'application
        const iconPath = path.join(__dirname, '..', '..', 'assets', 'appLogo.png');
        this.tray = new Tray(iconPath);

        // Définition du menu contextuel (clic droit)
        const contextMenu = Menu.buildFromTemplate([
            { 
                label: 'Ouvrir HomeStock', 
                click: () => {
                    console.log('[TRAY EVENT] Menu: Ouvrir HomeStock');
                    mainWindow.show();
                } 
            },
            { 
                label: 'Vérifier les stocks maintenant', 
                click: () => {
                    console.log('[TRAY EVENT] Menu: Scan manuel lancé');
                    WatcherService.checkAll();
                } 
            },
            { type: 'separator' },
            { 
                label: 'Quitter', 
                click: () => {
                    console.log('[TRAY EVENT] Menu: Quitter l\'application');
                    app.isQuitting = true;
                    app.quit();
                } 
            }
        ]);

        this.tray.setToolTip('HomeStock - Gestion de stocks du domicile');
        this.tray.setContextMenu(contextMenu);

        // Gestion du clic gauche (Toggle Show/Hide)
        this.tray.on('click', () => {
            console.log('[TRAY EVENT] Clic gauche détecté');
            if (mainWindow.isVisible()) {
                console.log('   > Fenêtre visible -> Masquage');
                mainWindow.hide();
            } else {
                console.log('   > Fenêtre masquée -> Affichage');
                mainWindow.show();
            }
        });

        console.log('[TRAY SERVICE] Tray prêt et opérationnel.');
    }
}

module.exports = new TrayService();