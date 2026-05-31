/* Generate app icon files on first run using Electron's nativeImage */
const { nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets');

/** Create a simple colored-circle icon as raw BGRA pixel data */
function createCircleIcon(size, color, highlightColor) {
  const buffer = Buffer.alloc(size * size * 4, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1;
  const highlightR = size / 4;

  // Parse hex color: #rrggbb → {r, g, b}
  const hexToRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const main = hexToRgb(color);
  const hl = highlightColor ? hexToRgb(highlightColor) : null;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx = (y * size + x) * 4;

      if (dist <= outerR) {
        // Anti-aliased edge (1px soft edge)
        let alpha = 1;
        if (dist > outerR - 1) {
          alpha = outerR - dist;
        }

        buffer[idx] = main.b;       // B
        buffer[idx + 1] = main.g;   // G
        buffer[idx + 2] = main.r;   // R
        buffer[idx + 3] = Math.round(0xff * alpha); // A
      }

      // Highlight (upper-left arc)
      if (hl && dist <= highlightR && dx <= 0 && dy <= 0) {
        buffer[idx] = hl.b;
        buffer[idx + 1] = hl.g;
        buffer[idx + 2] = hl.r;
        buffer[idx + 3] = 0xbb; // semi-transparent
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

/**
 * Ensure asset files exist, generating them if needed.
 * Called once at app startup.
 */
function ensureAssets() {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Cannot create assets directory:', e.message);
    return;
  }

  // --- tray-icon.png (16x16) ---
  const trayPath = path.join(ASSETS_DIR, 'tray-icon.png');
  if (!fs.existsSync(trayPath)) {
    try {
      const trayIcon = createCircleIcon(32, '#ff6b6b', '#ffaaaa');
      fs.writeFileSync(trayPath, trayIcon.toPNG());
      console.log('Generated tray-icon.png');
    } catch (e) {
      console.warn('Failed to generate tray-icon.png:', e.message);
    }
  }

  // --- icon.png (256x256, used as app/window icon + build icon) ---
  const iconPath = path.join(ASSETS_DIR, 'icon.png');
  if (!fs.existsSync(iconPath)) {
    try {
      const appIcon = createCircleIcon(256, '#ff6b6b', '#ffaaaa');
      fs.writeFileSync(iconPath, appIcon.toPNG());
      console.log('Generated icon.png');
    } catch (e) {
      console.warn('Failed to generate icon.png:', e.message);
    }
  }
}

module.exports = { ensureAssets };
