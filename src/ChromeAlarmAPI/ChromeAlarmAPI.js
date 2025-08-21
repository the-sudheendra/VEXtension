
class ChromeAlarmManager {
  constructor() {
    this.listeners = new Map();
    this.init();
  }


  init() {
    if (typeof chrome !== 'undefined' && chrome.alarms) {
      // Set up the main alarm listener
      chrome.alarms.onAlarm.addListener((alarm) => {
        this.handleAlarmTrigger(alarm);
      });
    } else {
      console.warn('Chrome alarms API not available');
    }
  }

  /**
   * Set a new alarm
   */
  async setAlarm(name, alarmInfo = {}) {
    try {
      if (!name || typeof name !== 'string') {
        throw new Error('Alarm name must be a non-empty string');
      }

      return new Promise((resolve, reject) => {
        chrome.alarms.create(name, alarmInfo, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log(`Alarm "${name}" created successfully`);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error setting alarm:', error);
      throw error;
    }
  }

  /**
   * Get a specific alarm by name
   * @param {string} name - Name of the alarm
   * @returns {Promise<Object|null>} - Alarm object or null if not found
   */
  async getAlarm(name) {
    try {
      return new Promise((resolve, reject) => {
        chrome.alarms.get(name, (alarm) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(alarm || null);
          }
        });
      });
    } catch (error) {
      console.error('Error getting alarm:', error);
      throw error;
    }
  }

  /**
   * Get all alarms
   * @returns {Promise<Array>} - Array of all alarm objects
   */
  async getAllAlarms() {
    try {
      return new Promise((resolve, reject) => {
        chrome.alarms.getAll((alarms) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(alarms || []);
          }
        });
      });
    } catch (error) {
      console.error('Error getting all alarms:', error);
      throw error;
    }
  }

  /**
   * Update an existing alarm
   * @param {string} name - Name of the alarm to update
   * @param {Object} newAlarmInfo - New alarm configuration
   * @returns {Promise<boolean>} - Success status
   */
  async updateAlarm(name, newAlarmInfo) {
    try {
      // Check if alarm exists first
      const existingAlarm = await this.getAlarm(name);
      if (!existingAlarm) {
        throw new Error(`Alarm "${name}" not found`);
      }

      // Delete the old alarm and create a new one with updated info
      await this.deleteAlarm(name);
      return await this.setAlarm(name, newAlarmInfo);
    } catch (error) {
      console.error('Error updating alarm:', error);
      throw error;
    }
  }

  /**
   * Delete a specific alarm
   * @param {string} name - Name of the alarm to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAlarm(name) {
    try {
      return new Promise((resolve, reject) => {
        chrome.alarms.clear(name, (wasCleared) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log(`Alarm "${name}" ${wasCleared ? 'deleted' : 'not found'}`);
            resolve(wasCleared);
          }
        });
      });
    } catch (error) {
      console.error('Error deleting alarm:', error);
      throw error;
    }
  }

  /**
   * Delete all alarms
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAllAlarms() {
    try {
      return new Promise((resolve, reject) => {
        chrome.alarms.clearAll((wasCleared) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log(`All alarms ${wasCleared ? 'deleted' : 'already cleared'}`);
            resolve(wasCleared);
          }
        });
      });
    } catch (error) {
      console.error('Error deleting all alarms:', error);
      throw error;
    }
  }

  /**
   * Check if an alarm exists
   * @param {string} name - Name of the alarm
   * @returns {Promise<boolean>} - Whether alarm exists
   */
  async alarmExists(name) {
    try {
      const alarm = await this.getAlarm(name);
      return alarm !== null;
    } catch (error) {
      console.error('Error checking alarm existence:', error);
      return false;
    }
  }

  /**
   * Get the next scheduled time for an alarm
   * @param {string} name - Name of the alarm
   * @returns {Promise<Date|null>} - Next scheduled time or null
   */
  async getNextScheduledTime(name) {
    try {
      const alarm = await this.getAlarm(name);
      return alarm ? new Date(alarm.scheduledTime) : null;
    } catch (error) {
      console.error('Error getting next scheduled time:', error);
      return null;
    }
  }

  /**
   * Get time remaining until alarm fires
   * @param {string} name - Name of the alarm
   * @returns {Promise<number|null>} - Milliseconds until alarm fires, or null
   */
  async getTimeRemaining(name) {
    try {
      const nextTime = await this.getNextScheduledTime(name);
      return nextTime ? nextTime.getTime() - Date.now() : null;
    } catch (error) {
      console.error('Error getting time remaining:', error);
      return null;
    }
  }

  /**
   * Set a delayed alarm (fires once after specified minutes)
   * @param {string} name - Name of the alarm
   * @param {number} delayInMinutes - Minutes to wait
   * @returns {Promise<boolean>} - Success status
   */
  async setDelayedAlarm(name, delayInMinutes) {
    return this.setAlarm(name, { delayInMinutes });
  }

  /**
   * Set a repeating alarm
   * @param {string} name - Name of the alarm
   * @param {number} periodInMinutes - Interval in minutes
   * @param {number} [delayInMinutes] - Initial delay before first trigger
   * @returns {Promise<boolean>} - Success status
   */
  async setRepeatingAlarm(name, periodInMinutes, delayInMinutes = 0) {
    const alarmInfo = { periodInMinutes };
    if (delayInMinutes > 0) {
      alarmInfo.delayInMinutes = delayInMinutes;
    }
    return this.setAlarm(name, alarmInfo);
  }

  /**
   * Set an alarm for a specific date and time
   * @param {string} name - Name of the alarm
   * @param {Date} date - Date and time when alarm should fire
   * @returns {Promise<boolean>} - Success status
   */
  async setAlarmAt(name, date) {
    if (!(date instanceof Date)) {
      throw new Error('Date must be a valid Date object');
    }
    return this.setAlarm(name, { when: date.getTime() });
  }

  /**
   * Add a custom listener for specific alarm
   * @param {string} name - Name of the alarm
   * @param {Function} callback - Function to call when alarm fires
   */
  addAlarmListener(name, callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, []);
    }
    this.listeners.get(name).push(callback);
  }

  /**
   * Remove a specific alarm listener
   * @param {string} name - Name of the alarm
   * @param {Function} callback - Function to remove
   */
  removeAlarmListener(name, callback) {
    const listeners = this.listeners.get(name);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an alarm
   * @param {string} name - Name of the alarm
   */
  removeAllListenersForAlarm(name) {
    this.listeners.delete(name);
  }

  /**
   * Handle alarm trigger events
   * @private
   * @param {Object} alarm - Alarm object from Chrome API
   */
  handleAlarmTrigger(alarm) {
    console.log(`Alarm "${alarm.name}" triggered at`, new Date());
    
    // Call custom listeners
    const listeners = this.listeners.get(alarm.name);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(alarm);
        } catch (error) {
          console.error(`Error in alarm listener for "${alarm.name}":`, error);
        }
      });
    }
  }

  /**
   * Get alarm statistics
   * @returns {Promise<Object>} - Statistics about alarms
   */
  async getStatistics() {
    try {
      const alarms = await this.getAllAlarms();
      const stats = {
        total: alarms.length,
        oneTime: 0,
        repeating: 0,
        nextAlarm: null,
        nextAlarmTime: null
      };

      let earliestTime = Infinity;
      let earliestAlarm = null;

      alarms.forEach(alarm => {
        if (alarm.periodInMinutes) {
          stats.repeating++;
        } else {
          stats.oneTime++;
        }

        if (alarm.scheduledTime < earliestTime) {
          earliestTime = alarm.scheduledTime;
          earliestAlarm = alarm;
        }
      });

      if (earliestAlarm) {
        stats.nextAlarm = earliestAlarm.name;
        stats.nextAlarmTime = new Date(earliestTime);
      }

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Export all alarms configuration
   * @returns {Promise<Array>} - Array of alarm configurations
   */
  async exportAlarms() {
    try {
      const alarms = await this.getAllAlarms();
      return alarms.map(alarm => ({
        name: alarm.name,
        scheduledTime: alarm.scheduledTime,
        periodInMinutes: alarm.periodInMinutes
      }));
    } catch (error) {
      console.error('Error exporting alarms:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const alarmManager = new ChromeAlarmManager();

// Export both the class and the singleton instance
export { ChromeAlarmManager, alarmManager as default };