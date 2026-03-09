const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ConsumedHistories', {
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
    unit: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    consumedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    wasThrownAway: {
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
    tableName: 'ConsumedHistories',
    timestamps: true
  });
};
