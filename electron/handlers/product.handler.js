/**
 * @module product.handler
 * @description Database operations for Products.
 */
const db = require('../../config/dbConfig.js');

async function getAllProducts() {
    try {
        const products = await db.Products.findAll();
        return products.map(prod => prod.toJSON());
    } catch (error) {
        throw new Error('FAILED_TO_FETCH_PRODUCTS');
    }
}

async function createProduct(event, data) {
    try {
        const product = await db.Products.create(data);
        return product.toJSON();
    } catch (error) {
        throw new Error('FAILED_TO_CREATE_PRODUCT');
    }
}

async function deleteProduct(event, id) {
    try {
        await db.Products.destroy({ where: { id } });
        return { success: true, id };
    } catch (error) {
        throw new Error('FAILED_TO_DELETE_PRODUCT');
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    deleteProduct
};