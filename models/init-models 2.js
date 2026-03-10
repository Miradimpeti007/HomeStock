var DataTypes = require("sequelize").DataTypes;
var _Categories = require("./Categories");
var _ConsumedHistories = require("./ConsumedHistories");
var _Locations = require("./Locations");
var _Products = require("./Products");
var _ShoppingItems = require("./ShoppingItems");

function initModels(sequelize) {
  var Categories = _Categories(sequelize, DataTypes);
  var ConsumedHistories = _ConsumedHistories(sequelize, DataTypes);
  var Locations = _Locations(sequelize, DataTypes);
  var Products = _Products(sequelize, DataTypes);
  var ShoppingItems = _ShoppingItems(sequelize, DataTypes);

  ConsumedHistories.belongsTo(Categories, { as: "category", foreignKey: "categoryId"});
  Categories.hasMany(ConsumedHistories, { as: "ConsumedHistories", foreignKey: "categoryId"});
  Products.belongsTo(Categories, { as: "category", foreignKey: "categoryId"});
  Categories.hasMany(Products, { as: "Products", foreignKey: "categoryId"});
  ShoppingItems.belongsTo(Categories, { as: "category", foreignKey: "categoryId"});
  Categories.hasMany(ShoppingItems, { as: "ShoppingItems", foreignKey: "categoryId"});
  ConsumedHistories.belongsTo(Locations, { as: "location", foreignKey: "locationId"});
  Locations.hasMany(ConsumedHistories, { as: "ConsumedHistories", foreignKey: "locationId"});
  Products.belongsTo(Locations, { as: "location", foreignKey: "locationId"});
  Locations.hasMany(Products, { as: "Products", foreignKey: "locationId"});
  ShoppingItems.belongsTo(Products, { as: "linkedProduct", foreignKey: "linkedProductId"});
  Products.hasMany(ShoppingItems, { as: "ShoppingItems", foreignKey: "linkedProductId"});

  return {
    Categories,
    ConsumedHistories,
    Locations,
    Products,
    ShoppingItems,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
