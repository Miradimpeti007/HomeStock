/**
 * @module models/Settings
 * @description Définition manuelle du modèle Settings pour correspondre à la table SQL.
 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Settings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Settings',
    timestamps: true // IMPORTANT : Pour gérer automatiquement createdAt et updatedAt
  });
};