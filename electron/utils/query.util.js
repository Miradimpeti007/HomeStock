/**
 * @module utils/query.util
 * @description Centralise la logique de filtrage, validation et pagination.
 */
const log = require('electron-log');

class QueryHelper {
    /**
     * @param {Object} input - Filtres bruts du frontend.
     * @param {Object} mapping - Règles de transformation.
     */
    static sanitizeFilters(input, mapping) {
        const where = {};
        
        Object.keys(mapping).forEach(key => {
            // Vérification de sécurité sur la propriété de l'objet
            if (!Object.prototype.hasOwnProperty.call(input, key)) return;

            const rawValue = input[key];

            if (rawValue === undefined || rawValue === null || rawValue === '') {
                log.warn(`[QUERY_VALIDATION] La clé '${key}' est présente mais vide.`);
                return;
            }

            const sanitizedValue = mapping[key](rawValue);

            if (sanitizedValue !== null) {
                where[key] = sanitizedValue;
            } else {
                log.warn(`[QUERY_VALIDATION] Filtre '${key}' invalide.`);
            }
        });

        return where;
    }

    /**
     * @param {Object} input - Données de création ou modification.
     * @param {Object} mapping - Schéma de validation strict.
     */
    static validateData(input, mapping) {
        const cleanData = {};
        
        for (const key of Object.keys(mapping)) {
            // Sécurité : Vérifie si le champ attendu est physiquement présent
            if (!Object.prototype.hasOwnProperty.call(input, key)) {
                return { data: null, error: `Le champ obligatoire '${key}' est manquant.` };
            }

            const rawValue = input[key];

            // Validation de non-vacuité pour les données obligatoires
            if (rawValue === undefined || rawValue === null || rawValue === '') {
                return { data: null, error: `Le champ '${key}' ne peut pas être vide.` };
            }

            const validatedValue = mapping[key](rawValue);

            if (validatedValue === null) {
                return { data: null, error: `La valeur pour '${key}' est invalide.` };
            }

            cleanData[key] = validatedValue;
        }

        return { data: cleanData, error: null };
    }

    /**
     * @param {number|string} page - Numéro de page.
     */
    static getPaginationParams(page) {
        const limit = 20;
        const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;
        return { limit, offset };
    }
}

module.exports = QueryHelper;