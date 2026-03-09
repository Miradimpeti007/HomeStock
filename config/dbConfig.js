const { Sequelize } = require('sequelize');
const path = require('path');
const initModels = require('../models/init-models');

const dbPath = path.join(__dirname, '..', 'database', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

const models = initModels(sequelize);

module.exports = {
  sequelize,
  ...models
};
