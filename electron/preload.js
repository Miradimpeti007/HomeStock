/**
 * @module preload
 * @description Context bridge exposing safe APIs to the renderer process.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    categories: {
        getAll: () => ipcRenderer.invoke('categories:getAll'),
        
    },
    products: {
        getAll: () => ipcRenderer.invoke('products:getAll'),
       
    }
});