const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const defaultTheme = {
  accentWork: '#ff6b6b',
  accentBreak: '#4ecdc4',
  accentLongBreak: '#45b7d1',
  bgType: 'solid',
  bgSolid: '#1a1b2e',
  bgGradient: { direction: '135deg', color1: '#1a1b2e', color2: '#2d1b4e' },
  bgImageUrl: '',
  cardBg: '#252742', cardOpacity: 1,
  textPrimary: '#e8e9f0', textSecondary: '#8b8daa',
  ringBg: '#2a2c4a', btnBg: '#2f3155', btnHover: '#3c3f6b',
  glowOpacity: 0.3,
};

const defaultSettings = {
  work: 25, break: 5, long: 15, longInterval: 4,
  volume: 0.7, autoStartNext: true,
};

const defaultQuotes = {
  userQuotes: [], rotationStrategy: 'per-session',
};

const defaults = {
  settings: defaultSettings,
  theme: defaultTheme,
  quotes: defaultQuotes,
  window: { width: 420, height: 700, alwaysOnTop: false },
  app: { minimizeToTray: true, firstRun: true },
};

let configPath;
let data = {};

function initStore() {
  const userDataPath = app.getPath('userData');
  configPath = path.join(userDataPath, 'config.json');

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    data = JSON.parse(raw);
    // Merge missing defaults
    for (const key of Object.keys(defaults)) {
      if (!(key in data)) data[key] = defaults[key];
    }
  } catch (e) {
    data = JSON.parse(JSON.stringify(defaults));
    save();
  }
}

function save() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) { /* ignore */ }
}

const store = {
  get(key, fallback) {
    const keys = key.split('.');
    let val = data;
    for (const k of keys) {
      if (val == null) return fallback;
      val = val[k];
    }
    return val !== undefined ? val : fallback;
  },

  set(key, value) {
    const keys = key.split('.');
    let obj = data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    save();
  },
};

module.exports = { initStore, store, defaultTheme, defaultSettings, defaultQuotes };
