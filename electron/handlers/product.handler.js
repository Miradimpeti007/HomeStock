/**
 * @module handlers/product.handler
 */
const { Op } = require('sequelize');
const db = require('../../config/dbConfig.js');
const ResponseHandler = require('../utils/response.util.js');
const QueryHelper = require('../utils/query.util.js');

/**
 * @description Contrat de validation basé sur le schéma de la base de données.
 */
const productValidationMapping = {
    name: (val) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : null),
    quantity: (val) => (isNaN(parseFloat(val)) || parseFloat(val) < 0 ? null : parseFloat(val)),
    minQuantity: (val) => (isNaN(parseFloat(val)) || parseFloat(val) < 0 ? null : parseFloat(val)),
    unit: (val) => (['L', 'kg', 'ml', 'mg', 'unite'].includes(val) ? val : null),
    expirationDate: (val) => (isNaN(Date.parse(val)) ? null : val),
    autoRefill: (val) => (typeof val === 'boolean' ? val : (val === 0 || val === 1 ? !!val : null)),
    categoryId: (val) => (isNaN(parseInt(val, 10)) || parseInt(val, 10) <= 0 ? null : parseInt(val, 10)),
    locationId: (val) => (isNaN(parseInt(val, 10)) || parseInt(val, 10) <= 0 ? null : parseInt(val, 10))
};



/**
 * @description Schémas de validation pour les différentes opérations.
 */
const deleteMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    wasThrownAway: (val) => (typeof val === 'boolean' ? val : null)
};

const qtyUpdateMapping = {
    id: (val) => (isNaN(parseInt(val, 10)) ? null : parseInt(val, 10)),
    change: (val) => (isNaN(parseFloat(val)) ? null : parseFloat(val))
};

/**
 * @description Récupère les produits filtrés avec pagination complète et métadonnées.
 */
async function getAllProducts(_, filters = {}) {
    try {
        const today = new Date();
        const inThreeDays = new Date();
        inThreeDays.setDate(today.getDate() + 3);

        const productMapping = {
            categoryId: (val) => (isNaN(parseInt(val)) ? null : parseInt(val)),
            locationId: (val) => (isNaN(parseInt(val)) ? null : parseInt(val)),
            unit: (val) => (['L', 'kg', 'ml', 'mg', 'unite'].includes(val) ? val : null),
            autoRefill: (val) => (typeof val === 'boolean' ? val : null),
            quantity: (val) => (isNaN(parseFloat(val)) ? null : parseFloat(val)),
            status: (val) => {
                if (val === 'expired') return { [Op.lt]: today };
                if (val === 'urgent') return { [Op.between]: [today, inThreeDays] };
                if (val === 'safe') return { [Op.gt]: inThreeDays };
                return null;
        }
        };

        const where = QueryHelper.sanitizeFilters(filters, productMapping);
        
        if (where.status) {
            where.expirationDate = where.status;
            delete where.status;
        }

        const { limit, offset } = QueryHelper.getPaginationParams(filters.page);
        const currentPage = Math.max(1, parseInt(filters.page, 10) || 1);

        const { count, rows } = await db.Products.findAndCountAll({
            where,
            include: [
                { model: db.Categories, as: 'category' },
                { model: db.Locations, as: 'location' }
            ],
            limit: limit,
            offset: offset
        });

        let totalPages = Math.ceil(count / limit);
        if(totalPages === 0 || currentPage > totalPages) totalPages = 1; // Assurer au moins une page même si aucun résultat
        let lastPage=false;

        if(currentPage === totalPages) {
            lastPage=true;
        }



        return ResponseHandler.success({
            totalItems: count,
            items: rows.map(p => p.toJSON()),
            totalPages: totalPages,
            currentPage: currentPage,
            lastPage: lastPage
        });

    } catch (error) {
        return ResponseHandler.error(error, 'FETCH_ERROR', 'Erreur lors de la récupération des produits.');
    }
}

/**
 * @description Création sécurisée d'un produit.
 */
async function createProduct(_, rawData) {
    try {
        const { data, error } = QueryHelper.validateData(rawData, productValidationMapping);
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const product = await db.Products.create(data);
        return ResponseHandler.success(product.toJSON());
    } catch (err) {
        return ResponseHandler.error(err, 'CREATE_ERROR', "Échec technique de création.");
    }
}

/**
 * @description Modifie un produit et synchronise l'état de l'inventaire avec la liste de courses.
 * Cette méthode gère deux scénarios critiques : l'archivage automatique en cas de rupture (0) 
 * et la création d'alertes de réapprovisionnement basées sur le seuil minQuantity.
 */
async function updateProduct(_, rawData) {
    const transaction = await db.sequelize.transaction();
    try {
        if (!rawData.id) {
            await transaction.rollback();
            return ResponseHandler.error(null, 'ID_REQUIRED', "L'identifiant est obligatoire.");
        }

        // Validation stricte de l'intégralité des champs du contrat produit
        const { data, error } = QueryHelper.validateData(rawData, productValidationMapping);
        if (error) {
            await transaction.rollback();
            return ResponseHandler.error(null, 'VALIDATION_FAILED', error);
        }

        const product = await db.Products.findByPk(rawData.id, { transaction });
        if (!product) {
            await transaction.rollback();
            return ResponseHandler.error(null, 'NOT_FOUND', "Produit introuvable.");
        }

        // Calcul de la condition de réapprovisionnement
        const needsRefill = data.autoRefill && data.quantity <= data.minQuantity;

        // SCÉNARIO 1 : La mise à jour définit une quantité nulle (Rupture)
        if (data.quantity === 0) {
            // Archivage immédiat vers ConsumedHistories
            await db.ConsumedHistories.create({
                name: data.name,
                unit: data.unit,
                consumedDate: new Date(),
                wasThrownAway: false,
                categoryId: data.categoryId,
                locationId: data.locationId
            }, { transaction });

            // Si autoRefill est actif, ajout à la liste de courses avant suppression
            if (data.autoRefill) {
                await db.ShoppingItems.findOrCreate({
                    where: { linkedProductId: product.id, isCompleted: false },
                    defaults: {
                        name: data.name,
                        quantity: 1,
                        unit: data.unit,
                        isCompleted: false,
                        categoryId: data.categoryId,
                        linkedProductId: product.id
                    },
                    transaction
                });
            }

            // Suppression physique du produit de l'inventaire actif
            await product.destroy({ transaction });
            await transaction.commit();
            return ResponseHandler.success({ id: rawData.id, status: 'DELETED_AUTO' });
        }

        // SCÉNARIO 2 : Mise à jour classique avec maintien en stock
        await product.update(data, { transaction });

        // Déclenchement de la liste de courses si le seuil d'alerte est atteint ou franchi
        if (needsRefill) {
            await db.ShoppingItems.findOrCreate({
                where: { linkedProductId: product.id, isCompleted: false },
                defaults: {
                    name: data.name,
                    quantity: 1,
                    unit: data.unit,
                    isCompleted: false,
                    categoryId: data.categoryId,
                    linkedProductId: product.id
                },
                transaction
            });
        }

        await transaction.commit();
        return ResponseHandler.success(product.toJSON());

    } catch (err) {
        if (transaction) await transaction.rollback();
        return ResponseHandler.error(err, 'UPDATE_ERROR', "Erreur lors de la modification et synchronisation.");
    }
}

/**
 * @description Supprime un produit et l'archive dans ConsumedHistories.
 * Cette méthode est utilisée pour les suppressions manuelles ou automatiques (quantité = 0).
 */
async function deleteProduct(_, rawData) {
    const transaction = await db.sequelize.transaction();
    try {
        const { data, error } = QueryHelper.validateData(rawData, deleteMapping);
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const product = await db.Products.findByPk(data.id, { transaction });
        if (!product) {
            await transaction.rollback();
            return ResponseHandler.error(null, 'NOT_FOUND', "Produit introuvable.");
        }

        // Archivage vers ConsumedHistories selon le schéma fourni
        await db.ConsumedHistories.create({
            name: product.name,
            unit: product.unit,
            consumedDate: new Date(),
            wasThrownAway: data.wasThrownAway,
            categoryId: product.categoryId,
            locationId: product.locationId
        }, { transaction });

        await product.destroy({ transaction });
        await transaction.commit();

        return ResponseHandler.success({ id: data.id, archived: true });
    } catch (err) {
        if (transaction) await transaction.rollback();
        return ResponseHandler.error(err, 'DELETE_ERROR', "Échec de l'archivage et de la suppression.");
    }
}

/**
 * @description Ajuste la quantité et gère l'automatisation du cycle de vie (archivage + shopping).
 */
async function updateQuantity(_, rawData) {
    const transaction = await db.sequelize.transaction();
    try {
        
        const { data, error } = QueryHelper.validateData(rawData, qtyUpdateMapping);
        if (error) return ResponseHandler.error(null, 'VALIDATION_FAILED', error);

        const product = await db.Products.findByPk(data.id, { transaction });
        if (!product) {
            await transaction.rollback();
            return ResponseHandler.error(null, 'NOT_FOUND', "Produit introuvable.");
        }

        const newQuantity = Math.max(0, product.quantity + data.change);

        // CAS 1 : RUPTURE DE STOCK (Quantité = 0)
        if (newQuantity === 0) {
            // Archivage dans l'historique de consommation
            await db.ConsumedHistories.create({
                name: product.name,
                unit: product.unit,
                consumedDate: new Date(),
                wasThrownAway: false,
                categoryId: product.categoryId,
                locationId: product.locationId
            }, { transaction });

            // Vérification Auto-Refill pour ajout immédiat en liste de courses
            if (product.autoRefill) {
                await db.ShoppingItems.findOrCreate({
                    where: { linkedProductId: product.id, isCompleted: false },
                    defaults: {
                        name: product.name,
                        quantity: 1,
                        unit: product.unit,
                        isCompleted: false,
                        categoryId: product.categoryId,
                        linkedProductId: product.id
                    },
                    transaction
                });
            }

            // Suppression définitive de l'inventaire actif
            await product.destroy({ transaction });
            await transaction.commit();
            return ResponseHandler.success({ id: data.id, status: 'DELETED_AUTO', quantity: 0 });
        }

        // CAS 2 : MISE À JOUR SIMPLE (Quantité > 0)
        await product.update({ quantity: newQuantity }, { transaction });

        // Vérification du seuil de réapprovisionnement classique
        const needsRefill = product.autoRefill && newQuantity <= product.minQuantity;
        if (needsRefill) {
            await db.ShoppingItems.findOrCreate({
                where: { linkedProductId: product.id, isCompleted: false },
                defaults: {
                    name: product.name,
                    quantity: 1,
                    unit: product.unit,
                    isCompleted: false,
                    categoryId: product.categoryId,
                    linkedProductId: product.id
                },
                transaction
            });
        }

        await transaction.commit();
        return ResponseHandler.success({ id: product.id, quantity: newQuantity, needsRefill });

    } catch (err) {
        if (transaction) await transaction.rollback();
        return ResponseHandler.error(err, 'QTY_UPDATE_ERROR', "Erreur technique d'ajustement du stock.");
    }
}

module.exports = { 
    getAllProducts, 
    createProduct, 
    updateProduct, 
    updateQuantity, 
    deleteProduct };