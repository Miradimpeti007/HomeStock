/**
 * @module handlers/config.handler
 * @description Gère la configuration (Catégories et Emplacements) avec validation de couleur et protection stricte.
 */
const { Op } = require('sequelize');
const db = require('../../config/dbConfig.js');
const ResponseHandler = require('../utils/response.util.js');
const QueryHelper = require('../utils/query.util.js');

/**
 * @description Schémas de validation. La couleur est obligatoire pour les catégories.
 */
const locationMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    name: (val) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : null)
};

const categoryMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    name: (val) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : null),

    /**
     * @description Valide soit l'Hex (#FFF ou #FFFFFF), soit le RGB (rgb(0,0,0)).
     */
    color: (val) => {
        if (typeof val !== 'string') return null;

        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbRegex = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/;

        if (hexRegex.test(val)) return val;
        if (rgbRegex.test(val)) return val;

        return null;
    }
};

/**
 * @section GESTION DES CATÉGORIES
 */

async function getAllCategories() {
    try {
        const categories = await db.Categories.findAll({ order: [['name', 'ASC']] });
        return ResponseHandler.success(categories.map(c => c.toJSON()));
    } catch (err) {
        return ResponseHandler.error(err, 'FETCH_CAT_ERROR', "Erreur de récupération des catégories.");
    }
}

async function createCategory(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, { 
            name: categoryMapping.name, 
            color: categoryMapping.color 
        });

        if (error || !data.color) return ResponseHandler.error(null, 'VALIDATION_FAILED', "Le nom et une couleur HEX ou rgb valide (#FFFFFF) rgb(0,0,0) sont obligatoires.");

        const existing = await db.Categories.findOne({ where: { name: data.name } });
        if (existing) return ResponseHandler.error(null, 'ALREADY_EXISTS', "Ce nom de catégorie existe déjà.");

        const category = await db.Categories.create({ 
            name: data.name, 
            color: data.color 
        }, { timestamps: false });

        return ResponseHandler.success(category.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'CREATE_CAT_ERROR', "Impossible de créer la catégorie.");
    }
}

async function updateCategory(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, categoryMapping);
        if (error || !data.id || !data.color) return ResponseHandler.error(null, 'VALIDATION_FAILED', "ID, nom et couleur  obligatoires.");

        const category = await db.Categories.findByPk(data.id);
        if (!category) return ResponseHandler.error(null, 'NOT_FOUND', "Catégorie introuvable.");

        const duplicate = await db.Categories.findOne({ 
            where: { name: data.name, id: { [Op.ne]: data.id } } 
        });

        if(data.id === 12 || category.name === 'Générique') {
            return ResponseHandler.error(null, 'RESERVED', "Action interdite : 'Générique' est une ressource protégée.");
        }

        if (duplicate) return ResponseHandler.error(null, 'ALREADY_EXISTS', "Ce nom est déjà utilisé par une autre catégorie.");

        await category.update({ name: data.name, color: data.color });
        return ResponseHandler.success(category.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'UPDATE_CAT_ERROR', "Erreur lors de la modification.");
    }
}

async function deleteCategory(_, rawData) {
    try {
        const id = parseInt(rawData.id, 10);
        if (isNaN(id)) return ResponseHandler.error(null, 'INVALID_ID', "ID invalide.");

        const category = await db.Categories.findByPk(id);
        if (!category) return ResponseHandler.error(null, 'NOT_FOUND', "Catégorie introuvable.");

      
        if (id === 12 || category.name === 'Générique') {
            return ResponseHandler.error(null, 'RESERVED', "Action interdite : 'Générique' est une ressource protégée.");
        }

        const productCount = await db.Products.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return ResponseHandler.error(null, 'IN_USE', `Suppression impossible : liée à ${productCount} produit(s).`);
        }

        await category.destroy();
        return ResponseHandler.success({ id, deleted: true });
    } catch (err) {
        return ResponseHandler.error(err, 'DELETE_CAT_ERROR', "Erreur technique lors de la suppression.");
    }
}

/**
 * @section GESTION DES EMPLACEMENTS
 */

async function getAllLocations() {
    try {
        const locations = await db.Locations.findAll({ order: [['name', 'ASC']] });
        return ResponseHandler.success(locations.map(l => l.toJSON()));
    } catch (err) {
        return ResponseHandler.error(err, 'FETCH_LOC_ERROR', "Erreur de récupération des lieux.");
    }
}

async function createLocation(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, { name: locationMapping.name });
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const existing = await db.Locations.findOne({ where: { name: data.name } });
        if (existing) return ResponseHandler.error(null, 'ALREADY_EXISTS', "Cet emplacement existe déjà.");

        const location = await db.Locations.create(data);
        return ResponseHandler.success(location.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'CREATE_LOC_ERROR', "Impossible de créer l'emplacement.");
    }
}

async function updateLocation(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, locationMapping);
        if (error || !data.id) return ResponseHandler.error(null, 'VALIDATION_FAILED', "ID et nom requis.");

        const location = await db.Locations.findByPk(data.id);
        if (!location) return ResponseHandler.error(null, 'NOT_FOUND', "Emplacement introuvable.");

        if (data.id === 8 || location.name === 'Non classé') {
            return ResponseHandler.error(null, 'RESERVED', "Action interdite : 'Non classé' est une ressource protégée.");
        }

        const duplicate = await db.Locations.findOne({ 
            where: { name: data.name, id: { [Op.ne]: data.id } } 
        });
        if (duplicate) return ResponseHandler.error(null, 'ALREADY_EXISTS', "Ce nom d'emplacement est déjà utilisé.");

        await location.update({ name: data.name });
        return ResponseHandler.success(location.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'UPDATE_LOC_ERROR', "Erreur lors de la modification.");
    }
}

async function deleteLocation(_, rawData) {
    try {
        const id = parseInt(rawData.id, 10);
        if (isNaN(id)) return ResponseHandler.error(null, 'INVALID_ID', "ID invalide.");

        const location = await db.Locations.findByPk(id);
        if (!location) return ResponseHandler.error(null, 'NOT_FOUND', "Emplacement introuvable.");

     
        if (id === 8 || location.name === 'Non classé') {
            return ResponseHandler.error(null, 'RESERVED', "Action interdite : 'Non classé' est une ressource protégée.");
        }

        const productCount = await db.Products.count({ where: { locationId: id } });
        if (productCount > 0) {
            return ResponseHandler.error(null, 'IN_USE', `Suppression impossible : liée à ${productCount} produit(s).`);
        }

        await location.destroy();
        return ResponseHandler.success({ id, deleted: true });
    } catch (err) {
        return ResponseHandler.error(err, 'DELETE_LOC_ERROR', "Erreur technique lors de la suppression.");
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllLocations,
    createLocation,
    updateLocation,
    deleteLocation
};