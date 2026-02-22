const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Products', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    minQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "U"
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    autoRefill: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Products',
    timestamps: true
  });
};
