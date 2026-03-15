const db =  require('../../config/dbConfig.js');
const { Settings } = db;

/**
 * @module handlers/settings.handler
 * @description Manages system settings retrieval and updates via Sequelize.
 */

/**
 * Fetches all settings and transforms them into a key-value object.
 * Converts [ {key: 'alert', value: 'true'} ] to { alert: true }.
 * @returns {Promise<Object>} Object containing all settings with typed values.
 */
async function getAllSettings() {
    try {
        const settingsArray = await Settings.findAll();
        
        const settingsMap = {};
        settingsArray.forEach(item => {
            // Automatic conversion of strings to boolean/numbers for the frontend
            let val = item.value;
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(val) && val !== '') val = Number(val);
            
            settingsMap[item.key] = val;
        });

        return { success: true, data: settingsMap };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { success: false, error: 'FAILED_TO_FETCH_SETTINGS' };
    }
}

/**
 * Updates a specific setting by its key.
 * @param {Object} event - Electron IPC event.
 * @param {Object} payload - Object containing 'key' and 'value'.
 * @returns {Promise<Object>} Result of the update operation.
 */
async function updateSetting(_, { key, value }) {
    try {
        const setting = await Settings.findOne({ where: { key } });
        
        if (!setting) {
            return { success: false, error: 'SETTING_NOT_FOUND' };
        }

        // We store everything as string in SQLite to maintain the Key-Value pattern
        await setting.update({ value: String(value) });

        return { success: true, data: { key, value } };
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { success: false, error: 'FAILED_TO_UPDATE_SETTING' };
    }
}

module.exports = {
    getAllSettings,
    updateSetting
};