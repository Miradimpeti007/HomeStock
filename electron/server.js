/**
 * @module main
 * @description Point d'entrée principal du processus Electron.
 * Gère le cycle de vie de l'application et la communication IPC.
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

/**
 * @description Détermine si l'application tourne en mode développement.
 */
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

/**
 * @description Initialise la fenêtre principale avec les paramètres de sécurité requis.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Empêche l'affichage avant que le contenu ne soit prêt
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.maximize();

    /**
     * @description Logique de chargement conditionnelle.
     * En développement : utilise le serveur HMR de Nuxt (Vite).
     * En production : charge le build statique exporté.
     */
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../test/dashboard.html'));
        mainWindow.webContents.openDevTools();
    }

    /**
     * @description Affiche la fenêtre uniquement quand le moteur de rendu est prêt.
     * Évite le flash blanc au démarrage de l'application.
     */
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    /**
     * @description Libère la référence de l'objet lors de la fermeture de la fenêtre.
     */
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * @description Cycle de vie : Initialisation de l'application.
 */
app.whenReady().then(() => {
    registerAllIpc();
    createWindow();

    /**
     * @description Spécificité macOS : Recrée une fenêtre si l'icône du Dock est cliquée
     * alors qu'aucune autre fenêtre n'est active.
     */
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * @description Cycle de vie : Fermeture de l'application.
 * Quitte l'application sur Windows et Linux, mais garde le processus actif sur macOS.
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});