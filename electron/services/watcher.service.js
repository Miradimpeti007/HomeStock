const db = require('../../config/dbConfig.js');
const { Products, Settings } = db;
const { Op } = require('sequelize');
const NotificationService = require('./notification.service');

/**
 * @module services/watcher.service
 * @description Surveille les produits (péremption et stock) et génère des alertes.
 */
class WatcherService {
  /**
   * Lance une vérification complète des stocks et des dates.
   */
  static async checkAll() {
    try {
      // 1. Vérifier si les alertes sont activées dans les réglages
      const settingsArray = await Settings.findAll();
      const config = {};
      settingsArray.forEach(s => config[s.key] = s.value === 'true');

      if (!config.expiration_alerts && !config.stock_alerts) return;

      let alertLines = [];

      // 2. Traitement des dates de péremption
      if (config.expiration_alerts) {
        const expiryAlerts = await this._processExpiry();
        alertLines = [...alertLines, ...expiryAlerts];
      }

      // 3. Traitement des stocks
      if (config.stock_alerts) {
        const stockAlerts = await this._processStock();
        alertLines = [...alertLines, ...stockAlerts];
      }

      // 4. Envoi de la notification groupée si des alertes existent
      if (alertLines.length > 0) {
        const title = `HomeStock : ${alertLines.length} alertes détectées`;
        const body = alertLines.join('\n');
        NotificationService.send(title, body);
      }

    } catch (error) {
      console.error('Erreur lors du cycle de surveillance :', error);
    }
  }

  /** @private Scanne les produits pour la péremption */
  static async _processExpiry() {
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + 3);

    const products = await Products.findAll({
      where: {
        expirationDate: { [Op.lte]: limitDate },
        quantity: { [Op.gt]: 0 } // On ne prévient pas pour ce qui est déjà fini
      }
    });

    return products.map(p => {
      const isExpired = new Date(p.expirationDate) <= today;
      const status = isExpired ? '🔴 PÉRIMÉ' : '🟠 Bientôt périmé';
      const mention = p.autoRefill ? '(Ajouté aux courses)' : '(À faire manuellement)';
      return `• ${p.name} : ${status} ${mention}`;
    });
  }

  /** @private Scanne les produits pour le stock */
  static async _processStock() {
    const products = await Products.findAll({
      where: {
        [Op.or]: [
          { quantity: 0 },
          { quantity: { [Op.lte]: db.sequelize.col('minQuantity') } }
        ]
      }
    });

    return products.map(p => {
      const status = p.quantity === 0 ? '🚫 RUPTURE' : '⚠️ STOCK BAS';
      const mention = p.autoRefill ? '(Ajouté aux courses)' : '(À faire manuellement)';
      return `• ${p.name} : ${status} ${mention}`;
    });
  }

  /**
   * Initialise le planificateur (toutes les 6 heures).
   */
  static initScheduler() {
    // const SIX_HOURS = 6 * 60 * 60 * 1000;
    const SIX_HOURS = 10 * 1000;

    

    
    // Premier lancement au démarrage
    setTimeout(() => this.checkAll(), 5000); 

    // Planification récurrente
    setInterval(() => {
      this.checkAll();
    }, SIX_HOURS);
  }
}

module.exports = WatcherService;