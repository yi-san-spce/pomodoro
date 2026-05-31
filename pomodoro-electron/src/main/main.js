const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { initStore, store } = require('./store');
const { setupTray, updateTrayPlayState } = require('./tray');
const { registerIpcHandlers } = require('./ipc-handlers');
const { ensureAssets } = require('./assets-init');

let mainWindow = null;
let isQuitting = false;

const isDev = process.argv.includes('--dev');

function createWindow() {
  const windowState = store.get('window', {});

  mainWindow = new BrowserWindow({
    width: windowState.width || 420,
    height: windowState.height || 700,
    x: windowState.x,
    y: windowState.y,
    minWidth: 360,
    minHeight: 580,
    resizable: true,
    frame: true,
    alwaysOnTop: windowState.alwaysOnTop || false,
    show: false,
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
    },
  });

  // Load renderer
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  // Graceful show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Save window bounds on resize/move
  const saveWindowState = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds();
      store.set('window.x', bounds.x);
      store.set('window.y', bounds.y);
      store.set('window.width', bounds.width);
      store.set('window.height', bounds.height);
    }
  };

  mainWindow.on('resize', debounce(saveWindowState, 500));
  mainWindow.on('move', debounce(saveWindowState, 500));

  // Minimize to tray on close (if enabled)
  mainWindow.on('close', (event) => {
    const minimizeToTray = store.get('app.minimizeToTray', true);
    if (!isQuitting && minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; connect-src 'self' https:;",
        ],
      },
    });
  });
}

// Debounce utility (in main process)
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === App Lifecycle ===

app.whenReady().then(() => {
  initStore();
  ensureAssets();   // Generate icon files on first run
  createWindow();
  registerIpcHandlers(() => mainWindow);
  setupTray(mainWindow);

  // macOS: re-create window on activate
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Mark first run
  if (store.get('app.firstRun', true)) {
    store.set('app.firstRun', false);
  }
});

app.on('window-all-closed', () => {
  // On Windows/Linux, quit when all windows closed (unless tray hidden)
  const minimizeToTray = store.get('app.minimizeToTray', true);
  if (!minimizeToTray) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  // Save final window state
  if (mainWindow && !mainWindow.isDestroyed()) {
    const bounds = mainWindow.getBounds();
    store.set('window.x', bounds.x);
    store.set('window.y', bounds.y);
    store.set('window.width', bounds.width);
    store.set('window.height', bounds.height);
  }
});
