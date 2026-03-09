/**
 * @module preload
 * @description Pont de contexte sécurisé exposant les APIs au processus de rendu.
 * Ce module isole le processus de rendu de l'accès direct aux modules Node.js d'Electron.
 */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * @description Expose les méthodes de l'API dans l'objet global 'window.api'.
 * Chaque méthode invoque un canal IPC spécifique défini dans le processus principal.
 */
contextBridge.exposeInMainWorld('api', {
    products: {
        /**
         * @description Récupère la liste des produits avec pagination et filtres.
         * @param {Object} filters - Critères de recherche (page, catégorie, etc.).
         * @returns {Promise<Object>} Résultat de l'opération (success, data/error).
         */
        getAll: (filters) => ipcRenderer.invoke('products:getAll', filters),

        /**
         * @description Crée un nouveau produit en base de données.
         * @param {Object} productData - Les informations du produit à créer.
         * @returns {Promise<Object>}
         */
        create: (productData) => ipcRenderer.invoke('products:create', productData),

        /**
         * @description Met à jour l'intégralité des champs d'un produit existant.
         * @param {Object} productData - Données incluant l'ID du produit.
         * @returns {Promise<Object>}
         */
        update: (productData) => ipcRenderer.invoke('products:update', productData),

        /**
         * @description Ajuste rapidement la quantité d'un produit (incrément/décrément).
         * @param {Object} qtyData - Contient l'ID et la valeur de modification ('change').
         * @returns {Promise<Object>}
         */
        updateQty: (qtyData) => ipcRenderer.invoke('products:updateQty', qtyData),

        /**
         * @description Supprime un produit et déclenche son archivage.
         * @param {Object} deleteData - Contient l'ID et la raison de suppression.
         * @returns {Promise<Object>}
         */
        delete: (deleteData) => ipcRenderer.invoke('products:delete', deleteData)
    }
});