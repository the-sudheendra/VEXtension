/**
 * Chrome Notifications API Interface
 * A comprehensive wrapper for chrome.notifications API
 */
class ChromeNotificationsAPI {
  constructor() {
    this.notificationCallbacks = new Map();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for notification events
   */
  setupEventListeners() {
    if (chrome.notifications) {
      // Listen for notification clicks
      chrome.notifications.onClicked.addListener((notificationId) => {
        this.handleNotificationClick(notificationId);
      });

      // Listen for notification button clicks
      chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
        this.handleButtonClick(notificationId, buttonIndex);
      });

      // Listen for notification close events
      chrome.notifications.onClosed.addListener((notificationId, byUser) => {
        this.handleNotificationClose(notificationId, byUser);
      });

      // Listen for permission level changes
      chrome.notifications.onPermissionLevelChanged.addListener((level) => {
        this.handlePermissionLevelChange(level);
      });

      // Listen for notification show events
      chrome.notifications.onShowSettings.addListener(() => {
        this.handleShowSettings();
      });
    }
  }

  /**
   * Create a basic notification
   * @param {string} notificationId - Unique identifier for the notification
   * @param {Object} options - Notification options
   * @param {Function} callback - Optional callback function
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createNotification(notificationId, options, callback = null) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Notification',
        message: 'This is a notification message'
      };

      const finalOptions = { ...defaultOptions, ...options };

      if (callback) {
        this.notificationCallbacks.set(notificationId, callback);
      }

      chrome.notifications.create(notificationId, finalOptions, (createdId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(createdId);
        }
      });
    });
  }

  /**
   * Create a basic text notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} iconUrl - Icon URL (optional)
   * @param {Object} additionalOptions - Additional options
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createBasicNotification(title, message, iconUrl = 'icon.png', additionalOptions = {}) {
    const notificationId = `basic_${Date.now()}`;
    const options = {
      type: 'basic',
      iconUrl,
      title,
      message,
      ...additionalOptions
    };

    return this.createNotification(notificationId, options);
  }

  /**
   * Create an image notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} imageUrl - Image URL
   * @param {string} iconUrl - Icon URL (optional)
   * @param {Object} additionalOptions - Additional options
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createImageNotification(title, message, imageUrl, iconUrl = 'icon.png', additionalOptions = {}) {
    const notificationId = `image_${Date.now()}`;
    const options = {
      type: 'image',
      iconUrl,
      title,
      message,
      imageUrl,
      ...additionalOptions
    };

    return this.createNotification(notificationId, options);
  }

  /**
   * Create a list notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Array} items - Array of list items {title, message}
   * @param {string} iconUrl - Icon URL (optional)
   * @param {Object} additionalOptions - Additional options
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createListNotification(title, message, items, iconUrl = 'icon.png', additionalOptions = {}) {
    const notificationId = `list_${Date.now()}`;
    const options = {
      type: 'list',
      iconUrl,
      title,
      message,
      items,
      ...additionalOptions
    };

    return this.createNotification(notificationId, options);
  }

  /**
   * Create a progress notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {number} progress - Progress value (0-100)
   * @param {string} iconUrl - Icon URL (optional)
   * @param {Object} additionalOptions - Additional options
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createProgressNotification(title, message, progress = 0, iconUrl = 'icon.png', additionalOptions = {}) {
    const notificationId = `progress_${Date.now()}`;
    const options = {
      type: 'progress',
      iconUrl,
      title,
      message,
      progress,
      ...additionalOptions
    };

    return this.createNotification(notificationId, options);
  }

  /**
   * Update an existing notification
   * @param {string} notificationId - Notification ID to update
   * @param {Object} options - Updated options
   * @returns {Promise<boolean>} Promise that resolves to success status
   */
  async updateNotification(notificationId, options) {
    return new Promise((resolve, reject) => {
      chrome.notifications.update(notificationId, options, (wasUpdated) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(wasUpdated);
        }
      });
    });
  }

  /**
   * Update progress notification
   * @param {string} notificationId - Notification ID
   * @param {number} progress - New progress value (0-100)
   * @param {string} message - Optional new message
   * @returns {Promise<boolean>} Promise that resolves to success status
   */
  async updateProgress(notificationId, progress, message = null) {
    const options = { progress };
    if (message) {
      options.message = message;
    }
    return this.updateNotification(notificationId, options);
  }

  /**
   * Clear/remove a notification
   * @param {string} notificationId - Notification ID to clear
   * @returns {Promise<boolean>} Promise that resolves to success status
   */
  async clearNotification(notificationId) {
    return new Promise((resolve, reject) => {
      chrome.notifications.clear(notificationId, (wasCleared) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          // Clean up callback if exists
          this.notificationCallbacks.delete(notificationId);
          resolve(wasCleared);
        }
      });
    });
  }

  /**
   * Get all active notifications
   * @returns {Promise<Object>} Promise that resolves to object with notification IDs as keys
   */
  async getAllNotifications() {
    return new Promise((resolve, reject) => {
      chrome.notifications.getAll((notifications) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(notifications);
        }
      });
    });
  }

  /**
   * Get permission level
   * @returns {Promise<string>} Promise that resolves to permission level
   */
  async getPermissionLevel() {
    return new Promise((resolve, reject) => {
      chrome.notifications.getPermissionLevel((level) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(level);
        }
      });
    });
  }

  /**
   * Clear all notifications
   * @returns {Promise<Array>} Promise that resolves to array of cleared notification results
   */
  async clearAllNotifications() {
    try {
      const notifications = await this.getAllNotifications();
      const clearPromises = Object.keys(notifications).map(id => this.clearNotification(id));
      return Promise.all(clearPromises);
    } catch (error) {
      throw new Error(`Failed to clear all notifications: ${error.message}`);
    }
  }

  /**
   * Create notification with buttons
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Array} buttons - Array of button objects {title, iconUrl}
   * @param {string} iconUrl - Icon URL (optional)
   * @param {Function} onButtonClick - Callback for button clicks
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createNotificationWithButtons(title, message, buttons, iconUrl = 'icon.png', onButtonClick = null) {
    const notificationId = `buttons_${Date.now()}`;
    const options = {
      type: 'basic',
      iconUrl,
      title,
      message,
      buttons
    };

    if (onButtonClick) {
      this.notificationCallbacks.set(`${notificationId}_button`, onButtonClick);
    }

    return this.createNotification(notificationId, options);
  }

  /**
   * Create a scheduled notification that auto-clears after a delay
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {number} delay - Delay in milliseconds before auto-clear
   * @param {Object} options - Additional notification options
   * @returns {Promise<string>} Promise that resolves to notification ID
   */
  async createTimedNotification(title, message, delay = 5000, options = {}) {
    const notificationId = await this.createBasicNotification(title, message, options.iconUrl, options);
    
    setTimeout(() => {
      this.clearNotification(notificationId);
    }, delay);

    return notificationId;
  }

  // Event Handlers
  handleNotificationClick(notificationId) {
    const callback = this.notificationCallbacks.get(notificationId);
    if (callback && typeof callback.onClick === 'function') {
      callback.onClick(notificationId);
    }
    
    // Emit custom event
    this.emit('notificationClick', { notificationId });
  }

  handleButtonClick(notificationId, buttonIndex) {
    const callback = this.notificationCallbacks.get(`${notificationId}_button`);
    if (callback && typeof callback === 'function') {
      callback(notificationId, buttonIndex);
    }
    
    // Emit custom event
    this.emit('buttonClick', { notificationId, buttonIndex });
  }

  handleNotificationClose(notificationId, byUser) {
    const callback = this.notificationCallbacks.get(notificationId);
    if (callback && typeof callback.onClose === 'function') {
      callback.onClose(notificationId, byUser);
    }
    
    // Clean up callback
    this.notificationCallbacks.delete(notificationId);
    this.notificationCallbacks.delete(`${notificationId}_button`);
    
    // Emit custom event
    this.emit('notificationClose', { notificationId, byUser });
  }

  handlePermissionLevelChange(level) {
    this.emit('permissionLevelChange', { level });
  }

  handleShowSettings() {
    this.emit('showSettings', {});
  }

  // Simple event emitter functionality
  emit(eventName, data) {
    const event = new CustomEvent(`chromeNotification:${eventName}`, { detail: data });
    document.dispatchEvent(event);
  }

  /**
   * Add event listener for notification events
   * @param {string} eventName - Event name (click, close, buttonClick, etc.)
   * @param {Function} callback - Event callback
   */
  addEventListener(eventName, callback) {
    document.addEventListener(`chromeNotification:${eventName}`, callback);
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(eventName, callback) {
    document.removeEventListener(`chromeNotification:${eventName}`, callback);
  }

  /**
   * Check if notifications are supported
   * @returns {boolean} True if notifications API is available
   */
  isSupported() {
    return !!(chrome && chrome.notifications);
  }

  /**
   * Batch create multiple notifications
   * @param {Array} notificationConfigs - Array of notification configurations
   * @returns {Promise<Array>} Promise that resolves to array of notification IDs
   */
  async createBatchNotifications(notificationConfigs) {
    const promises = notificationConfigs.map((config, index) => {
      const id = config.id || `batch_${Date.now()}_${index}`;
      return this.createNotification(id, config.options, config.callback);
    });

    return Promise.all(promises);
  }
}

// Export for use in Chrome extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChromeNotificationsAPI;
}

// Example usage:
/*
const notificationAPI = new ChromeNotificationsAPI();

// Basic notification
notificationAPI.createBasicNotification('Hello', 'This is a test notification');

// Progress notification
notificationAPI.createProgressNotification('Download', 'Downloading file...', 50);

// Notification with buttons
notificationAPI.createNotificationWithButtons(
  'Action Required', 
  'Choose an option',
  [
    { title: 'Accept', iconUrl: 'accept.png' },
    { title: 'Decline', iconUrl: 'decline.png' }
  ],
  'icon.png',
  (notificationId, buttonIndex) => {
    console.log(`Button ${buttonIndex} clicked for notification ${notificationId}`);
  }
);

// Listen to events
notificationAPI.addEventListener('notificationClick', (event) => {
  console.log('Notification clicked:', event.detail);
});

// Timed notification that auto-clears
notificationAPI.createTimedNotification('Temporary', 'This will disappear in 3 seconds', 3000);
*/