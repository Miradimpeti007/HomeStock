const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerAllIpc } = require('./ipc/index');
const WatcherService = require('./services/watcher.service');
const TrayService = require('./services/tray.service'); // Import du service Tray

const isDev = process.env.NODE_ENV === 'development';
let mainWindow;

// Flag pour différencier la fermeture de la fenêtre du "Quitter" réel
app.isQuitting = false;

function createWindow() {

    console.log('[SERVER] Création de la fenêtre principale...');
    
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.maximize();

    if (!isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../test/dashboard.html'));
        mainWindow.webContents.openDevTools();
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    /**
     * @description Intercepte la fermeture de la fenêtre.
     * Si on n'est pas en train de quitter l'app, on cache juste la fenêtre.
     */
    mainWindow.on('close', (event) => {
        
        if (!app.isQuitting) {
            console.log('[SERVER] Tentative de fermeture interceptée : Masquage vers le Tray.');
            event.preventDefault();
            mainWindow.hide();
        } else {
            console.log('[SERVER] Fermeture réelle de la fenêtre.');
        }
        return false;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.setAppUserModelId("com.homestock.app");

app.whenReady().then(() => {
    registerAllIpc();
    createWindow();
    WatcherService.initScheduler();
    
    // Initialisation du Tray avec la référence de la fenêtre
    TrayService.init(mainWindow);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * @description Avant de quitter, on s'assure que le flag est à true.
 */
app.on('before-quit', () => {
    console.log('[SERVER] Préparation de la fermeture de l\'application...');
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});