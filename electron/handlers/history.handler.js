/**
 * @module handlers/history.handler
 * @description Gère l'historique de consommation et de gaspillage.
 */
const { Op } = require('sequelize');
const db = require('../../config/dbConfig.js');
const ResponseHandler = require('../utils/response.util.js');
const QueryHelper = require('../utils/query.util.js');

/**
 * @description Mapping pour le filtrage de l'historique.
 */
const historyFilterMapping = {
    wasThrownAway: (val) => (typeof val === 'boolean' ? val : null),
    categoryId: (val) => (isNaN(parseInt(val)) ? null : parseInt(val)),
    locationId: (val) => (isNaN(parseInt(val)) ? null : parseInt(val)),
    // Filtre de date : attend un objet { start, end }
    consumedDate: (val) => {
        if (!val || !val.start || !val.end) return null;
        return { [Op.between]: [new Date(val.start), new Date(val.end)] };
    }
};

/**
 * @description Récupère l'historique avec filtres et pagination.
 */
async function getAllHistory(_, filters = {}) {
    try {
        const where = QueryHelper.sanitizeFilters(filters, historyFilterMapping);
        const { limit, offset } = QueryHelper.getPaginationParams(filters.page);
        const currentPage = Math.max(1, parseInt(filters.page, 10) || 1);

        const { count, rows } = await db.ConsumedHistories.findAndCountAll({
            where,
            include: [
                { model: db.Categories, as: 'category' },
                { model: db.Locations, as: 'location' }
            ],
            limit,
            offset,
            order: [['consumedDate', 'DESC']] // Plus récent en premier
        });

        const totalPages = Math.max(1, Math.ceil(count / limit));
        
        if(currentPage > totalPages || currentPage < 1) {
            currentPage = 1; // Réinitialiser à la première page si la page demandée est hors limites
        }

        return ResponseHandler.success({
            totalItems: count,
            items: rows.map(h => h.toJSON()),
            totalPages,
            currentPage,
            lastPage: currentPage === totalPages
        });
    } catch (error) {
        return ResponseHandler.error(error, 'HISTORY_FETCH_ERROR', "Erreur lors de la récupération de l'historique.");
    }
}

/**
 * @description Supprime une entrée spécifique de l'historique.
 */
async function deleteHistoryItem(_, rawData) {
    try {
        const id = parseInt(rawData.id, 10);
        if (isNaN(id)) return ResponseHandler.error(null, 'ID_REQUIRED', "ID invalide.");

        const deleted = await db.ConsumedHistories.destroy({ where: { id } });
        return ResponseHandler.success({ id, deleted: !!deleted });
    } catch (err) {
        return ResponseHandler.error(err, 'HISTORY_DELETE_ERROR', "Impossible de supprimer cette ligne.");
    }
}

/**
 * @description Vide entièrement l'historique.
 */
async function clearHistory() {
    try {
        await db.ConsumedHistories.destroy({ where: {}, truncate: false }); 
        return ResponseHandler.success({ cleared: true });
    } catch (err) {
        return ResponseHandler.error(err, 'HISTORY_CLEAR_ERROR', "Échec de la remise à zéro de l'historique.");
    }
}

module.exports = { getAllHistory, deleteHistoryItem, clearHistory };