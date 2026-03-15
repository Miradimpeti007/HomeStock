/**
 * @module handlers/shopping.handler
 * Gère la logique de la liste de courses pour un environnement Electron.
 * Cette classe communique directement avec Sequelize sans passer par un middleware Express.
 */
const db = require('../../config/dbConfig.js');
const ResponseHandler = require('../utils/response.util.js');
const QueryHelper = require('../utils/query.util.js');

/**
 * Contrats de validation stricts pour les opérations de la liste de courses.
 */
const shoppingAddMapping = {
    name: (val) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : null),
    quantity: (val) => (isNaN(parseFloat(val)) || parseFloat(val) < 0 ? null : parseFloat(val)),
    unit: (val) => (['L', 'kg', 'ml', 'mg', 'unite'].includes(val) ? val : 'unite'),
    categoryId: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
};

const shoppingQtyUpdateMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    quantity: (val) => (isNaN(parseFloat(val)) ? null : parseFloat(val))
};

/**
 * Récupère la liste de courses avec un filtrage optionnel sur le statut de complétion.
 * @param {Object} _ - Contexte Electron (unused)
 * @param {Object} filters - Filtres incluant potentiellement isCompleted
 */
async function getShoppingList(_, filters = {}) {
    try {
        const where = {};
        if (filters.hasOwnProperty('isCompleted')) {
            where.isCompleted = !!filters.isCompleted;
        }

        const items = await db.ShoppingItems.findAll({
            where,
            include: [{ model: db.Categories, as: 'category' }]
        });
        return ResponseHandler.success(items.map(item => item.toJSON()));
    } catch (error) {
        return ResponseHandler.error(error, 'FETCH_ERROR', "Erreur lors de la récupération de la liste.");
    }
}

/**
 * Ajoute un article à la liste de courses.
 * Attribue dynamiquement la catégorie "générique" via une recherche en base.
 */
async function addShoppingItem(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, shoppingAddMapping);
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        /**
         * Recherche de l'ID de la catégorie par défaut pour éviter les valeurs codées en dur.
         */
        const defaultCategory = await db.Categories.findOne({ 
            where: { name: 'Générique' } 
        });

        const item = await db.ShoppingItems.create({
            ...data,
            categoryId: data.categoryId || defaultCategory?.id || 12,
            linkedProductId:null, // Fallback à 12 si la catégorie n'existe pas
            isCompleted: false
        });
        
        return ResponseHandler.success(item.toJSON());
    } catch (error) {
        return ResponseHandler.error(error, 'ADD_ERROR', "Échec de l'ajout à la liste de courses.");
    }
}
 
/**
 * Met à jour exclusivement la quantité d'un article existant dans la liste.
 */
async function updateShoppingQuantity(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, shoppingQtyUpdateMapping);
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const item = await db.ShoppingItems.findByPk(data.id);
        if (!item) return ResponseHandler.error(null, 'NOT_FOUND', "Article introuvable.");

        await item.update({ quantity: item.quantity + data.quantity });
        return ResponseHandler.success(item.toJSON());
    } catch (error) {
        return ResponseHandler.error(error, 'UPDATE_ERROR', "Erreur de mise à jour de la quantité.");
    }
}

/**
 * Supprime un article unique de la liste de courses.
 */
async function deleteShoppingItem(_, { id }) {
    try {
        if (isNaN(parseInt(id, 10))) 
            return ResponseHandler.error(null, 'VALIDATION_FAILED', "format de l'ID  invalide.");

        const item = await db.ShoppingItems.findByPk(id);
        if (!item) return ResponseHandler.error(null, 'NOT_FOUND', "Article introuvable.");

        await item.destroy();
        return ResponseHandler.success({ id, deleted: true });
    } catch (error) {
        return ResponseHandler.error(error, 'DELETE_ERROR', "Erreur lors de la suppression de l'article.");
    }
}

/**
 * Supprime tous les articles de la liste de courses.
 */
async function clearAllShoppingItems() {
    try {
        await db.ShoppingItems.destroy({ where: {}, truncate: false });
        return ResponseHandler.success({ cleared: true });
    } catch (error) {
        return ResponseHandler.error(error, 'CLEAR_ERROR', "Erreur lors du vidage de la liste.");
    }
}

/**
 * Valide le panier et synchronise les quantités avec l'inventaire des produits.
 * Effectue des lookups dynamiques pour les catégories et localisations par défaut.
 * @returns {Object} Un résumé contenant les produits mis à jour et créés.
 */
async function validateCartToInventory(_, { itemIds }) {
    const transaction = await db.sequelize.transaction();
    

    const summary = {
        updatedCount: 0,
        createdCount: 0,
        updatedItems: [],
        createdItems: []
    };

    try {
        /**
         * Récupération dynamique des références obligatoires sans IDs en dur.
         */
        const [defaultCat, defaultLoc] = await Promise.all([
            db.Categories.findOne({ where: { name: 'Générique' }, transaction }),
            db.Locations.findOne({ where: { name: 'Non classé' }, transaction })
        ]);

        const items = await db.ShoppingItems.findAll({
            where: { id: itemIds },
            transaction
        });

        for (const item of items) {
            if (item.linkedProductId) {
                /**
                 * Mise à jour additive du stock pour les produits existants.
                 */
                const product = await db.Products.findByPk(item.linkedProductId, { transaction });
                if (product) {
                    await product.increment('quantity', { by: item.quantity, transaction });
                    await product.update({ updatedAt: new Date() }, { transaction });
                    
                    summary.updatedItems.push({ 
                        name: product.name, 
                        quantityAdded: item.quantity 
                    });
                    summary.updatedCount++;
                }
            } else {
                /**
                 * Création d'un nouveau produit avec les classifications par défaut trouvées en DB.
                 */
                const newProduct = await db.Products.create({
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    categoryId: item.categoryId || defaultCat?.id || 12, // Fallback à 12 si la catégorie n'existe pas
                    locationId: defaultLoc ? defaultLoc.id : 8, // Fallback à 8 si le lieu n'existe pas
                    minQuantity: 0,
                    autoRefill: false,
                    expirationDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }, { transaction });

                summary.createdItems.push(newProduct.toJSON());
                summary.createdCount++;
            }

           
            await item.destroy({ transaction });
        }

        await transaction.commit();
        return ResponseHandler.success(summary);

    } catch (error) {
        if (transaction) await transaction.rollback();
        return ResponseHandler.error(error, 'VALIDATION_ERROR', "Échec de la validation du panier.");
    }
}

/**
 * Toggles the completion status (check/uncheck) of an item.
 * Used for UI filtering and preparation for inventory validation.
 */
async function toggleItemCompletion(_, { id }) {
    try {
        if (isNaN(parseInt(id, 10))) 
            return ResponseHandler.error(null, 'VALIDATION_FAILED', "format de l'ID  invalide.");

        const item = await db.ShoppingItems.findByPk(id);
        if (!item) return ResponseHandler.error(null, 'NOT_FOUND', "Article introuvable.");

        await item.update({ isCompleted: !item.isCompleted });
        return ResponseHandler.success(item.toJSON());
    } catch (error) {
        return ResponseHandler.error(error, 'TOGGLE_ERROR', "Erreur lors du changement de statut.");
    }
}

module.exports = {
    getShoppingList,
    addShoppingItem,
    updateShoppingQuantity,
    toggleItemCompletion,
    deleteShoppingItem,
    clearAllShoppingItems,
    validateCartToInventory
};