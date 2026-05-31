const { ipcMain, BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { store, defaultTheme } = require('./store');
const { updateTrayPlayState } = require('./tray');

function registerIpcHandlers(mainWindowGetter) {
  function getMainWindow() {
    if (typeof mainWindowGetter === 'function') return mainWindowGetter();
    return BrowserWindow.getAllWindows()[0];
  }

  // ===== Settings =====
  ipcMain.handle('store:get-settings', () => {
    return store.get('settings');
  });

  ipcMain.handle('store:set-settings', (_event, settings) => {
    store.set('settings', settings);
    return true;
  });

  // ===== Theme =====
  ipcMain.handle('store:get-theme', () => {
    return store.get('theme');
  });

  ipcMain.handle('store:set-theme', (_event, theme) => {
    store.set('theme', theme);
    return true;
  });

  ipcMain.handle('store:reset-theme', () => {
    store.set('theme', defaultTheme);
    return defaultTheme;
  });

  // ===== Quotes =====
  ipcMain.handle('store:get-quotes', () => {
    return store.get('quotes');
  });

  ipcMain.handle('store:set-quotes', (_event, quotes) => {
    store.set('quotes', quotes);
    return true;
  });

  ipcMain.handle('store:add-quote', (_event, quote) => {
    const quotes = store.get('quotes');
    quotes.userQuotes.push(quote);
    store.set('quotes', quotes);
    return quote;
  });

  ipcMain.handle('store:remove-quote', (_event, id) => {
    const quotes = store.get('quotes');
    quotes.userQuotes = quotes.userQuotes.filter(q => q.id !== id);
    store.set('quotes', quotes);
    return true;
  });

  ipcMain.handle('data:get-default-quotes', () => {
    const filePath = path.join(__dirname, '..', '..', 'data', 'default-quotes.json');
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      return [];
    }
  });

  // ===== Window =====
  ipcMain.handle('window:toggle-always-on-top', () => {
    const win = getMainWindow();
    if (!win) return false;
    const newState = !win.isAlwaysOnTop();
    win.setAlwaysOnTop(newState);
    store.set('window.alwaysOnTop', newState);
    return newState;
  });

  ipcMain.handle('window:get-always-on-top', () => {
    const win = getMainWindow();
    if (!win) return false;
    return win.isAlwaysOnTop();
  });

  ipcMain.handle('window:minimize-to-tray', () => {
    const win = getMainWindow();
    if (!win) return;
    win.hide();
  });

  // ===== Tray =====
  ipcMain.handle('tray:update-play-state', (_event, isRunning) => {
    updateTrayPlayState(isRunning);
    return true;
  });

  // ===== App =====
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:get-platform', () => {
    return process.platform;
  });

  ipcMain.handle('app:get-minimize-to-tray', () => {
    return store.get('app.minimizeToTray', true);
  });

  ipcMain.handle('app:set-minimize-to-tray', (_event, value) => {
    store.set('app.minimizeToTray', value);
    return true;
  });
}

module.exports = { registerIpcHandlers };
