/**
 * @module handlers/config.handler
 * @description Gère la configuration de l'application (Catégories et Emplacements).
 */
const db = require('../../config/dbConfig.js');
const ResponseHandler = require('../utils/response.util.js');
const QueryHelper = require('../utils/query.util.js');

/**
 * @description Schéma de validation pour les emplacements.
 */
const locationMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    name: (val) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : null)
};

/**
 * @description Récupère toutes les catégories disponibles.
 * @returns {Promise<Object>} Liste des catégories.
 */
async function getAllCategories() {
    try {
        const categories = await db.Categories.findAll({
            order: [['name', 'ASC']]
        });
        return ResponseHandler.success(categories.map(c => c.toJSON()));
    } catch (err) {
        return ResponseHandler.error(err, 'FETCH_CAT_ERROR', "Erreur lors de la récupération des catégories.");
    }
}

/**
 * @description Récupère tous les emplacements de stockage.
 * @returns {Promise<Object>} Liste des emplacements.
 */
async function getAllLocations() {
    try {
        const locations = await db.Locations.findAll({
            order: [['name', 'ASC']]
        });
        return ResponseHandler.success(locations.map(l => l.toJSON()));
    } catch (err) {
        return ResponseHandler.error(err, 'FETCH_LOC_ERROR', "Erreur lors de la récupération des lieux.");
    }
}

/**
 * @description Crée un nouvel emplacement de stockage.
 * @param {Object} _ Instance Electron (inutilisée).
 * @param {Object} rawData Données de l'emplacement { name }.
 */
async function createLocation(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, { name: locationMapping.name });
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const location = await db.Locations.create(data);
        return ResponseHandler.success(location.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'CREATE_LOC_ERROR', "Impossible de créer l'emplacement.");
    }
}

/**
 * @description Met à jour le nom d'un emplacement existant.
 */
async function updateLocation(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, locationMapping);
        if (error || !data.id) return ResponseHandler.error(null, 'VALIDATION_FAILED', "ID et nom requis.");

        const location = await db.Locations.findByPk(data.id);
        if (!location) return ResponseHandler.error(null, 'NOT_FOUND', "Emplacement introuvable.");

        await location.update({ name: data.name });
        return ResponseHandler.success(location.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'UPDATE_LOC_ERROR', "Erreur lors de la modification de l'emplacement.");
    }
}

/**
 * @description Supprime un emplacement si celui-ci n'est plus utilisé par aucun produit.
 */
async function deleteLocation(_, rawData) {
    try {
        const id = parseInt(rawData.id, 10);
        if (isNaN(id)) return ResponseHandler.error(null, 'INVALID_ID', "ID invalide.");

        // Vérification de l'usage : Y a-t-il des produits dans cet emplacement ?
        const productCount = await db.Products.count({ where: { locationId: id } });
        if (productCount > 0) {
            return ResponseHandler.error(null, 'LOCATION_IN_USE', `Impossible de supprimer : ${productCount} produit(s) y sont encore stockés.`);
        }

        const locationGenerique = await db.Locations.findOne({ where: { name: 'Non classé' } });
        if (locationGenerique.id === id) {
            return ResponseHandler.error(null, 'LOCATION_RESERVED', "Impossible de supprimer l'emplacement reservé 'Non classé'.");
        }

        const deleted = await db.Locations.destroy({ where: { id } });
        return ResponseHandler.success({ id, deleted: !!deleted });
    } catch (err) {
        return ResponseHandler.error(err, 'DELETE_LOC_ERROR', "Erreur technique lors de la suppression.");
    }
}

module.exports = {
    getAllCategories,
    getAllLocations,
    createLocation,
    updateLocation,
    deleteLocation
};