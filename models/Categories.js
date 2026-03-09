const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Categories', {
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
    color: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "#FFFFFF"
    }
  }, {
    sequelize,
    tableName: 'Categories',
    timestamps: false
  });
};
