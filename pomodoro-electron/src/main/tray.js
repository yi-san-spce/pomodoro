const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let trayMenu = null;
let isPlayStateRunning = false;

function createTrayIcon() {
  // Try loading from file first
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
  try {
    const img = nativeImage.createFromPath(iconPath);
    if (!img.isEmpty()) return img.resize({ width: 16, height: 16 });
  } catch (e) { /* fall through */ }

  // Fallback: generate a 16x16 red circle icon from raw BGRA pixel data
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 7;
  const highlightR = 3.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * size + x) * 4;
      if (dist <= outerR) {
        // Main circle: tomato red (#ff6b6b)
        buffer[idx] = 0x6b;     // B
        buffer[idx + 1] = 0x6b; // G
        buffer[idx + 2] = 0xff; // R
        buffer[idx + 3] = 0xff; // A
      }
      // Highlight arc (upper-left)
      if (dist <= highlightR && x <= cx && y <= cy) {
        buffer[idx] = 0xaa;     // B
        buffer[idx + 1] = 0xaa; // G
        buffer[idx + 2] = 0xff; // R
        buffer[idx + 3] = 0xcc; // A (semi-transparent)
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function setupTray(mainWindow) {
  const trayImage = createTrayIcon();

  tray = new Tray(trayImage);
  tray.setToolTip('🍅 番茄钟');

  buildMenu(mainWindow);

  // Double-click restores window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function buildMenu(mainWindow) {
  const alwaysOnTop = mainWindow ? mainWindow.isAlwaysOnTop() : false;

  const template = [
    {
      label: isPlayStateRunning ? '⏸ 暂停' : '▶ 开始',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.executeJavaScript(
            `window.__trayTogglePlay && window.__trayTogglePlay()`
          );
        }
      },
    },
    {
      label: '⏭ 跳过',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript(
            `window.__traySkip && window.__traySkip()`
          );
        }
      },
    },
    { type: 'separator' },
    {
      label: alwaysOnTop ? '📌 窗口置顶 ✓' : '📌 窗口置顶 ✗',
      click: () => {
        if (mainWindow) {
          const newState = !mainWindow.isAlwaysOnTop();
          mainWindow.setAlwaysOnTop(newState);
          buildMenu(mainWindow); // rebuild to update label
        }
      },
    },
    { type: 'separator' },
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: '退出',
      click: () => {
        const { app } = require('electron');
        app.quit();
      },
    },
  ];

  trayMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(trayMenu);
}

function updateTrayPlayState(isRunning) {
  isPlayStateRunning = isRunning;
  const win = require('electron').BrowserWindow.getAllWindows()[0];
  if (win) {
    buildMenu(win);
  }
}

module.exports = { setupTray, updateTrayPlayState };
