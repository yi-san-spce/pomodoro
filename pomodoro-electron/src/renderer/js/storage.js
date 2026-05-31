/* ====== Storage Module — IPC-based persistence wrapper ====== */

const storage = {
  // Settings
  async getSettings() {
    return await window.pomodoroAPI.getSettings();
  },
  async setSettings(settings) {
    return await window.pomodoroAPI.setSettings(settings);
  },

  // Theme
  async getTheme() {
    return await window.pomodoroAPI.getTheme();
  },
  async setTheme(theme) {
    return await window.pomodoroAPI.setTheme(theme);
  },
  async resetTheme() {
    return await window.pomodoroAPI.resetTheme();
  },

  // Quotes
  async getQuotesConfig() {
    return await window.pomodoroAPI.getQuotes();
  },
  async setQuotesConfig(config) {
    return await window.pomodoroAPI.setQuotes(config);
  },
  async addQuote(quote) {
    return await window.pomodoroAPI.addQuote(quote);
  },
  async removeQuote(id) {
    return await window.pomodoroAPI.removeQuote(id);
  },
  async getDefaultQuotes() {
    return await window.pomodoroAPI.getDefaultQuotes();
  },

  // Window
  async toggleAlwaysOnTop() {
    return await window.pomodoroAPI.toggleAlwaysOnTop();
  },
  async getAlwaysOnTop() {
    return await window.pomodoroAPI.getAlwaysOnTop();
  },

  // App
  async getMinimizeToTray() {
    return await window.pomodoroAPI.getMinimizeToTray();
  },
  async setMinimizeToTray(value) {
    return await window.pomodoroAPI.setMinimizeToTray(value);
  },
};

// Expose for tray IPC
window.__storage = storage;
