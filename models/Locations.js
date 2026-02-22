const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Locations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    tableName: 'Locations',
    timestamps: false,
    indexes: [
      {
        name: "sqlite_autoindex_Locations_1",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};
