const { app, BrowserWindow } = require('electron');
const path = require('path');
<<<<<<< HEAD
const { registerAllIpc } = require('./ipc/index');
=======
>>>>>>> walidTest

let mainWindow;

function createWindow() {
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
    mainWindow.show();
<<<<<<< HEAD
    mainWindow.webContents.openDevTools();

    mainWindow.loadFile(path.join(__dirname, '../test/dashboard.html'));
}

app.whenReady().then(() => {

    registerAllIpc();
=======

    mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
>>>>>>> walidTest
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});