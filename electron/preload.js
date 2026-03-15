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
    },

    config: {
        /**
         * @description Récupère toutes les catégories (pour les menus déroulants).
         */
        getAllCategories: () => ipcRenderer.invoke('categories:getAll'),

        /**
         * @description Récupère tous les lieux de stockage.
         */
        getAllLocations: () => ipcRenderer.invoke('locations:getAll'),

        /**
         * @description Ajoute un nouvel emplacement (ex: Garage, Cave).
         */
        createLocation: (locationData) => ipcRenderer.invoke('locations:create', locationData),

        /**
         * @description Renomme un emplacement existant.
         */
        updateLocation: (locationData) => ipcRenderer.invoke('locations:update', locationData),

        /**
         * @description Supprime un emplacement (si vide).
         */
        deleteLocation: (idData) => ipcRenderer.invoke('locations:delete', idData)
    },

    history: {
        /**
         * @description Récupère l'historique de consommation avec filtres et pagination.
         * @param {Object} filters - Filtres (wasThrownAway, categoryId, locationId, date).
         * @returns {Promise<Object>}
         */
        getAll: (filters) => ipcRenderer.invoke('history:getAll', filters),

        /**
         * @description Supprime une entrée spécifique de l'historique.
         * @param {Object} idData - Contient l'ID de l'entrée à supprimer.
         * @returns {Promise<Object>}
         */
        deleteItem: (idData) => ipcRenderer.invoke('history:deleteItem', idData),

        /**
         * @description Efface l'intégralité de l'historique de consommation.
         * @returns {Promise<Object>}
         */
        clear: () => ipcRenderer.invoke('history:clear')
    },

    shopping: {
        /**
         * Récupère les articles de la liste.
         * @param {Object} filters - Exemple: { isCompleted: false }
         */
        getList: (filters) => ipcRenderer.invoke('shopping:get-list', filters),

        /**
         * Ajoute un article à la liste.
         * @param {Object} itemData - { name, quantity, unit, linkedProductId }
         */
        add: (itemData) => ipcRenderer.invoke('shopping:add-item', itemData),

        /**
         * Modifie la quantité d'un article.
         * @param {number} id - ID de l'article dans ShoppingItems
         * @param {number} quantity - Nouvelle valeur numérique
         */
        updateQty: (id, quantity) => ipcRenderer.invoke('shopping:update-qty', { id, quantity }),

        /**
         * Alterne l'état de complétion d'un article.
         */
        toggleCompletion: (id) => ipcRenderer.invoke('shopping:toggle-completion', { id }),

        /**
         * Supprime un article de la liste.
         */
        delete: (id) => ipcRenderer.invoke('shopping:delete-item', { id }),

        /**
         * Supprime tous les articles de la liste.
         */
        clearAll: () => ipcRenderer.invoke('shopping:clear-all'),

        /**
         * Valide les articles sélectionnés pour les transférer dans l'inventaire.
         * @param {Array<number>} itemIds - Liste des IDs à traiter
         */
        validateCart: (itemIds) => ipcRenderer.invoke('shopping:validate-cart', { itemIds })
    },

    settings: {
        /**
         * @description Récupère tous les réglages sous forme d'objet { cle: valeur }.
         * @returns {Promise<Object>}
         */
        getAll: () => ipcRenderer.invoke('settings:get-all'),

        /**
         * @description Met à jour un réglage spécifique.
         * @param {Object} settingData - Contient { key, value }.
         * @returns {Promise<Object>}
         */
        update: (settingData) => ipcRenderer.invoke('settings:update', settingData)
    }

    
});