/* ====== Theme Engine — CSS variable injection, presets, live preview ====== */

const ThemeEngine = {
  currentTheme: null,

  // Preset themes
  presets: {
    dark: {
      name: '暗黑', accentWork: '#ff6b6b', accentBreak: '#4ecdc4', accentLongBreak: '#45b7d1',
      bgSolid: '#1a1b2e', cardBg: '#252742', textPrimary: '#e8e9f0', textSecondary: '#8b8daa',
      ringBg: '#2a2c4a', btnBg: '#2f3155', btnHover: '#3c3f6b', glowOpacity: 0.3,
    },
    forest: {
      name: '森林', accentWork: '#2ecc71', accentBreak: '#27ae60', accentLongBreak: '#1abc9c',
      bgSolid: '#1a2e1f', cardBg: '#243829', textPrimary: '#e0f0e0', textSecondary: '#8aaa8a',
      ringBg: '#2a3d2f', btnBg: '#2f4533', btnHover: '#3d5a43', glowOpacity: 0.3,
    },
    ocean: {
      name: '海洋', accentWork: '#3498db', accentBreak: '#2980b9', accentLongBreak: '#1abc9c',
      bgSolid: '#1a2430', cardBg: '#1f2d3d', textPrimary: '#dce8f0', textSecondary: '#8a9faa',
      ringBg: '#263545', btnBg: '#2c3f52', btnHover: '#3a526b', glowOpacity: 0.3,
    },
    sunset: {
      name: '日落', accentWork: '#e67e22', accentBreak: '#d35400', accentLongBreak: '#f39c12',
      bgSolid: '#2e221a', cardBg: '#3d2b22', textPrimary: '#f0e0d0', textSecondary: '#aa9a8a',
      ringBg: '#4a352a', btnBg: '#523d30', btnHover: '#6b4f3d', glowOpacity: 0.3,
    },
  },

  hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  applyTheme(theme) {
    this.currentTheme = theme;
    const root = document.documentElement;

    // Accent colors
    root.style.setProperty('--work', theme.accentWork);
    root.style.setProperty('--work-glow', this.hexToRgba(theme.accentWork, theme.glowOpacity || 0.3));
    root.style.setProperty('--break', theme.accentBreak);
    root.style.setProperty('--break-glow', this.hexToRgba(theme.accentBreak, theme.glowOpacity || 0.3));
    root.style.setProperty('--long-break', theme.accentLongBreak);
    root.style.setProperty('--long-glow', this.hexToRgba(theme.accentLongBreak, theme.glowOpacity || 0.3));

    // Card & text
    root.style.setProperty('--card', theme.cardBg);
    root.style.setProperty('--card-opacity', theme.cardOpacity != null ? theme.cardOpacity : 1);
    root.style.setProperty('--text', theme.textPrimary);
    root.style.setProperty('--sub', theme.textSecondary);
    root.style.setProperty('--ring-bg', theme.ringBg);
    root.style.setProperty('--btn-bg', theme.btnBg);
    root.style.setProperty('--btn-hover', theme.btnHover);

    // Background
    switch (theme.bgType) {
      case 'solid':
      default:
        document.body.style.background = theme.bgSolid || '#1a1b2e';
        break;
      case 'gradient':
        const g = theme.bgGradient || { direction: '135deg', color1: '#1a1b2e', color2: '#2d1b4e' };
        document.body.style.background = `linear-gradient(${g.direction}, ${g.color1}, ${g.color2})`;
        break;
      case 'image':
        const url = theme.bgImageUrl || '';
        if (url) {
          document.body.style.background = `url(${url}) center/cover no-repeat`;
        } else {
          document.body.style.background = theme.bgSolid || '#1a1b2e';
        }
        break;
    }
  },

  getCurrentTheme() {
    return this.currentTheme;
  },
};
