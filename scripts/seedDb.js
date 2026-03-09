/**
 * Script de peuplement de la base de données (Seeder).
 * Ce script réinitialise le schéma de la base de données et insère un jeu de données initial.
 */
const db = require('../config/dbConfig.js');

async function seedDatabase() {
    try {
        // La méthode sync avec force: true agit comme un DROP TABLE IF EXISTS pour toutes les tables,
        // garantissant ainsi l'absence de doublons et la remise à zéro des auto-incréments.
        await db.sequelize.sync({ force: true });

        const categoriesData = [
            { name: 'Fruits', color: '#FF5252' },
            { name: 'Légumes', color: '#4CAF50' },
            { name: 'Viande', color: '#be2887' },
            { name: 'Poisson', color: '#00ACC1' },
            { name: 'Produits Laitiers', color: '#29B6F6' },
            { name: 'Épicerie', color: '#FFB300' },
            { name: 'Boissons', color: '#00ffc8' },
            { name: 'Boulangerie', color: '#FB8C00' },
            { name: 'Électroménager', color: '#008e0e' },
            { name: 'Hygiène', color: '#1b2bd8' },
            { name: 'Entretien', color: '#00897B' },
            { name: 'Générique', color: '#8E24AA' }
        ];

        const categories = await db.Categories.bulkCreate(categoriesData);

        const locationsData = [
            { name: 'Frigo' },
            { name: 'Congélateur' },
            { name: 'Cellier' },
            { name: 'Placard Cuisine' },
            { name: 'Salle de Bain' }
        ];

        const locations = await db.Locations.bulkCreate(locationsData);

        const getCatId = (name) => categories.find(c => c.name === name).id;
        const getLocId = (name) => locations.find(l => l.name === name).id;

        const productsData = [
            { name: 'Pommes Golden', quantity: 6, minQuantity: 2, unit: 'U', autoRefill: true, categoryId: getCatId('Fruits'), locationId: getLocId('Frigo') },
            { name: 'Steak Haché', quantity: 4, minQuantity: 2, unit: 'U', autoRefill: true, categoryId: getCatId('Viande'), locationId: getLocId('Congélateur') },
            { name: 'Lait Demi-écrémé', quantity: 2, minQuantity: 1, unit: 'L', autoRefill: true, categoryId: getCatId('Produits Laitiers'), locationId: getLocId('Cellier') },
            { name: 'Pâtes Penne', quantity: 1, minQuantity: 1, unit: 'Kg', autoRefill: false, categoryId: getCatId('Épicerie'), locationId: getLocId('Placard Cuisine') },
            { name: 'Jus d\'Orange', quantity: 1, minQuantity: 1, unit: 'L', autoRefill: true, categoryId: getCatId('Boissons'), locationId: getLocId('Frigo') },
            { name: 'Gel Douche', quantity: 3, minQuantity: 1, unit: 'U', autoRefill: false, categoryId: getCatId('Hygiène'), locationId: getLocId('Salle de Bain') },
            { name: 'Liquide Vaisselle', quantity: 1, minQuantity: 1, unit: 'U', autoRefill: true, categoryId: getCatId('Entretien'), locationId: getLocId('Placard Cuisine') }
        ];

        const products = await db.Products.bulkCreate(productsData);

        const shoppingItemsData = [
            { name: 'Tomates Grappe', quantity: 5, unit: 'U', isCompleted: false, categoryId: getCatId('Légumes') },
            { name: 'Lait Demi-écrémé', quantity: 6, unit: 'L', isCompleted: false, categoryId: getCatId('Produits Laitiers'), linkedProductId: products.find(p => p.name === 'Lait Demi-écrémé').id },
            { name: 'Baguette', quantity: 2, unit: 'U', isCompleted: true, categoryId: getCatId('Boulangerie') }
        ];

        await db.ShoppingItems.bulkCreate(shoppingItemsData);

        const consumedHistoryData = [
            { name: 'Pavé de Saumon', unit: 'U', wasThrownAway: false, categoryId: getCatId('Poisson'), locationId: getLocId('Congélateur'), consumedDate: new Date() },
            { name: 'Yaourt Nature', unit: 'U', wasThrownAway: false, categoryId: getCatId('Produits Laitiers'), locationId: getLocId('Frigo'), consumedDate: new Date() },
            { name: 'Salade Flétrie', unit: 'U', wasThrownAway: true, categoryId: getCatId('Légumes'), locationId: getLocId('Frigo'), consumedDate: new Date() }
        ];

        await db.ConsumedHistories.bulkCreate(consumedHistoryData);

        console.log('✅ Base de données SQLite peuplée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du peuplement de la base :', error);
        process.exit(1);
    }
}

seedDatabase();