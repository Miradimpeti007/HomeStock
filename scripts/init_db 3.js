const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false 
});

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#FFFFFF'
  }
}, { timestamps: false });

const Location = sequelize.define('Location', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { timestamps: false });

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'U'
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  autoRefill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

const ShoppingItem = sequelize.define('ShoppingItem', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'U'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

const ConsumedHistory = sequelize.define('ConsumedHistory', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  consumedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  wasThrownAway: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Product.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });
Location.hasMany(Product, { foreignKey: 'locationId' });

ShoppingItem.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(ShoppingItem, { foreignKey: 'categoryId' });

ShoppingItem.belongsTo(Product, { foreignKey: 'linkedProductId', as: 'linkedProduct' });
Product.hasMany(ShoppingItem, { foreignKey: 'linkedProductId' });

ConsumedHistory.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(ConsumedHistory, { foreignKey: 'categoryId' });

ConsumedHistory.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });
Location.hasMany(ConsumedHistory, { foreignKey: 'locationId' });

async function initDatabase() {
  try {
    console.log('Tentative de connexion à la base de données...');
    await sequelize.authenticate();
    console.log('Connexion réussie.');

    console.log('Synchronisation des modèles avec la base de données...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ Base de données "HomeStock" et schéma créés avec succès.');
    console.log(`Fichier généré : ${dbPath}`);

  } catch (error) {
    console.error('ERREUR lors de l\'initialisation de la base de données :', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

initDatabase();