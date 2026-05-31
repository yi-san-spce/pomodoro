const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pomodoroAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('store:get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('store:set-settings', settings),

  // Theme
  getTheme: () => ipcRenderer.invoke('store:get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('store:set-theme', theme),
  resetTheme: () => ipcRenderer.invoke('store:reset-theme'),

  // Quotes
  getQuotes: () => ipcRenderer.invoke('store:get-quotes'),
  setQuotes: (quotes) => ipcRenderer.invoke('store:set-quotes', quotes),
  addQuote: (quote) => ipcRenderer.invoke('store:add-quote', quote),
  removeQuote: (id) => ipcRenderer.invoke('store:remove-quote', id),
  getDefaultQuotes: () => ipcRenderer.invoke('data:get-default-quotes'),

  // Window
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top'),
  minimizeToTray: () => ipcRenderer.invoke('window:minimize-to-tray'),

  // Tray
  updateTrayPlayState: (isRunning) => ipcRenderer.invoke('tray:update-play-state', isRunning),

  // App
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  getMinimizeToTray: () => ipcRenderer.invoke('app:get-minimize-to-tray'),
  setMinimizeToTray: (value) => ipcRenderer.invoke('app:set-minimize-to-tray', value),
});
