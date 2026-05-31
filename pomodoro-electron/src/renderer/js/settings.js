/* ====== Settings Panel — Tabs, inputs, live preview, save ====== */

const SettingsPanel = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.$overlay = document.getElementById('settingsOverlay');
    this.$timerTab = document.getElementById('settingsTabTimer');
    this.$themeTab = document.getElementById('settingsTabTheme');
    this.$quotesTab = document.getElementById('settingsTabQuotes');
    this.$timerSection = document.getElementById('settingsTimer');
    this.$themeSection = document.getElementById('settingsTheme');
    this.$quotesSection = document.getElementById('settingsQuotes');

    this.bindEvents();
  },

  bindEvents() {
    // Tab switching
    const tabs = [this.$timerTab, this.$themeTab, this.$quotesTab];
    const sections = [this.$timerSection, this.$themeSection, this.$quotesSection];

    tabs.forEach((tab, i) => {
      if (!tab) return;
      tab.addEventListener('click', () => {
        tabs.forEach(t => t && t.classList.remove('active'));
        sections.forEach(s => s && s.classList.remove('active'));
        tab.classList.add('active');
        if (sections[i]) sections[i].classList.add('active');
      });
    });

    // Close
    document.getElementById('btnCloseSettings')?.addEventListener('click', () => this.close());

    // Overlay click
    this.$overlay?.addEventListener('click', (e) => {
      if (e.target === this.$overlay) this.close();
    });

    // Theme preset dots
    document.querySelectorAll('.preset-dot').forEach(dot => {
      dot.addEventListener('click', () => this.applyPreset(dot.dataset.preset));
    });

    // Theme color inputs — live preview
    const themeInputs = [
      'themeAccentWork', 'themeAccentBreak', 'themeAccentLongBreak',
      'themeCardBg', 'themeTextPrimary', 'themeTextSecondary',
      'themeRingBg', 'themeBtnBg', 'themeBtnHover',
      'themeBgSolid',
    ];
    themeInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.onThemeInputChange());
    });

    // Background type switch
    document.getElementById('themeBgType')?.addEventListener('change', () => {
      this.updateBgTypeVisibility();
      this.onThemeInputChange();
    });

    // Background gradient inputs
    document.getElementById('themeBgGradientColor1')?.addEventListener('input', () => this.onThemeInputChange());
    document.getElementById('themeBgGradientColor2')?.addEventListener('input', () => this.onThemeInputChange());
    document.getElementById('themeBgGradientDir')?.addEventListener('change', () => this.onThemeInputChange());

    // Background image URL
    document.getElementById('themeBgImageUrl')?.addEventListener('input', () => this.onThemeInputChange());

    // Glow opacity
    document.getElementById('themeGlowOpacity')?.addEventListener('input', () => this.onThemeInputChange());
    document.getElementById('themeCardOpacity')?.addEventListener('input', () => this.onThemeInputChange());

    // Save theme
    document.getElementById('btnSaveTheme')?.addEventListener('click', () => this.saveTheme());

    // Reset theme
    document.getElementById('btnResetTheme')?.addEventListener('click', () => this.resetTheme());

    // Quote rotation strategy
    document.getElementById('quoteStrategy')?.addEventListener('change', (e) => {
      QuotesEngine.setRotationStrategy(e.target.value);
    });

    // Add quote
    document.getElementById('btnAddQuote')?.addEventListener('click', () => this.addQuote());

    // Timer settings
    document.getElementById('setWork')?.addEventListener('change', () => this.onTimerSettingChange());
    document.getElementById('setBreak')?.addEventListener('change', () => this.onTimerSettingChange());
    document.getElementById('setLong')?.addEventListener('change', () => this.onTimerSettingChange());
    document.getElementById('setInterval')?.addEventListener('change', () => this.onTimerSettingChange());
    document.getElementById('setVolume')?.addEventListener('input', () => this.onTimerSettingChange());
    document.getElementById('setAutoStart')?.addEventListener('change', () => this.onTimerSettingChange());

    // Minimize to tray
    document.getElementById('setMinimizeToTray')?.addEventListener('change', (e) => {
      window.pomodoroAPI.setMinimizeToTray(e.target.checked);
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.$overlay?.classList.contains('open')) {
        this.close();
      }
    });
  },

  open(activeTab = 'timer') {
    this.init();
    this.populateTimerSettings();
    this.populateThemeSettings();
    this.populateQuotesTab();
    this.$overlay?.classList.add('open');

    // Switch to requested tab
    const tabMap = { timer: this.$timerTab, theme: this.$themeTab, quotes: this.$quotesTab };
    tabMap[activeTab]?.click();
  },

  close() {
    this.$overlay?.classList.remove('open');
  },

  // ===== Timer Settings =====
  populateTimerSettings() {
    const s = Timer.settings;
    this._setVal('setWork', s.work);
    this._setVal('setBreak', s.break);
    this._setVal('setLong', s.long);
    this._setVal('setInterval', s.longInterval);
    this._setVal('setVolume', Math.round(s.volume * 100));
    this._setCheck('setAutoStart', s.autoStartNext);

    // Minimize to tray
    window.pomodoroAPI.getMinimizeToTray().then(v => {
      this._setCheck('setMinimizeToTray', v);
    });
  },

  onTimerSettingChange() {
    const settings = {
      work: parseInt(document.getElementById('setWork')?.value) || 25,
      break: parseInt(document.getElementById('setBreak')?.value) || 5,
      long: parseInt(document.getElementById('setLong')?.value) || 15,
      longInterval: parseInt(document.getElementById('setInterval')?.value) || 4,
      volume: (parseInt(document.getElementById('setVolume')?.value) || 70) / 100,
      autoStartNext: document.getElementById('setAutoStart')?.checked ?? true,
    };
    Timer.updateSettings(settings);
    this._debounceSaveTimer(settings);
  },

  _timerSaveTimer: null,
  _debounceSaveTimer(settings) {
    clearTimeout(this._timerSaveTimer);
    this._timerSaveTimer = setTimeout(() => {
      window.pomodoroAPI.setSettings(settings);
    }, 500);
  },

  // ===== Theme Settings =====
  populateThemeSettings() {
    const t = ThemeEngine.currentTheme || {};
    this._setVal('themeAccentWork', t.accentWork || '#ff6b6b');
    this._setVal('themeAccentBreak', t.accentBreak || '#4ecdc4');
    this._setVal('themeAccentLongBreak', t.accentLongBreak || '#45b7d1');
    this._setVal('themeCardBg', t.cardBg || '#252742');
    this._setVal('themeTextPrimary', t.textPrimary || '#e8e9f0');
    this._setVal('themeTextSecondary', t.textSecondary || '#8b8daa');
    this._setVal('themeRingBg', t.ringBg || '#2a2c4a');
    this._setVal('themeBtnBg', t.btnBg || '#2f3155');
    this._setVal('themeBtnHover', t.btnHover || '#3c3f6b');
    this._setVal('themeBgSolid', t.bgSolid || '#1a1b2e');
    this._setVal('themeBgType', t.bgType || 'solid');
    this._setVal('themeBgGradientColor1', (t.bgGradient || {}).color1 || '#1a1b2e');
    this._setVal('themeBgGradientColor2', (t.bgGradient || {}).color2 || '#2d1b4e');
    this._setVal('themeBgGradientDir', (t.bgGradient || {}).direction || '135deg');
    this._setVal('themeBgImageUrl', t.bgImageUrl || '');
    this._setVal('themeGlowOpacity', t.glowOpacity || 0.3);
    this._setVal('themeCardOpacity', t.cardOpacity != null ? t.cardOpacity : 1);

    this.updateBgTypeVisibility();
    this.updatePresetSelection();
  },

  updateBgTypeVisibility() {
    const type = document.getElementById('themeBgType')?.value || 'solid';
    ['bgSolidRow', 'bgGradientRow', 'bgImageUrlRow'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (type === 'solid') document.getElementById('bgSolidRow')?.style.removeProperty('display');
    if (type === 'gradient') document.getElementById('bgGradientRow')?.style.removeProperty('display');
    if (type === 'image') document.getElementById('bgImageUrlRow')?.style.removeProperty('display');
  },

  updatePresetSelection() {
    document.querySelectorAll('.preset-dot').forEach(dot => {
      dot.classList.remove('selected');
    });
  },

  applyPreset(name) {
    const preset = ThemeEngine.presets[name];
    if (!preset) return;
    const theme = {
      ...preset,
      bgType: 'solid',
      bgImageUrl: '',
      bgGradient: { direction: '135deg', color1: '#1a1b2e', color2: '#2d1b4e' },
      cardOpacity: 1,
    };
    ThemeEngine.applyTheme(theme);
    this.populateThemeSettings();

    // Highlight selected
    document.querySelectorAll('.preset-dot').forEach(d => d.classList.remove('selected'));
    document.querySelector(`.preset-dot[data-preset="${name}"]`)?.classList.add('selected');

    // Save
    window.pomodoroAPI.setTheme(theme);
  },

  onThemeInputChange() {
    const theme = this._readThemeForm();
    ThemeEngine.applyTheme(theme);
    this.updatePresetSelection();
    this._debounceSaveTheme(theme);
  },

  _themeSaveTimer: null,
  _debounceSaveTheme(theme) {
    clearTimeout(this._themeSaveTimer);
    this._themeSaveTimer = setTimeout(() => {
      window.pomodoroAPI.setTheme(theme);
    }, 300);
  },

  _readThemeForm() {
    return {
      accentWork: this._getVal('themeAccentWork') || '#ff6b6b',
      accentBreak: this._getVal('themeAccentBreak') || '#4ecdc4',
      accentLongBreak: this._getVal('themeAccentLongBreak') || '#45b7d1',
      bgType: this._getVal('themeBgType') || 'solid',
      bgSolid: this._getVal('themeBgSolid') || '#1a1b2e',
      bgGradient: {
        direction: this._getVal('themeBgGradientDir') || '135deg',
        color1: this._getVal('themeBgGradientColor1') || '#1a1b2e',
        color2: this._getVal('themeBgGradientColor2') || '#2d1b4e',
      },
      bgImageUrl: this._getVal('themeBgImageUrl') || '',
      cardBg: this._getVal('themeCardBg') || '#252742',
      cardOpacity: parseFloat(this._getVal('themeCardOpacity')) ?? 1,
      textPrimary: this._getVal('themeTextPrimary') || '#e8e9f0',
      textSecondary: this._getVal('themeTextSecondary') || '#8b8daa',
      ringBg: this._getVal('themeRingBg') || '#2a2c4a',
      btnBg: this._getVal('themeBtnBg') || '#2f3155',
      btnHover: this._getVal('themeBtnHover') || '#3c3f6b',
      glowOpacity: parseFloat(this._getVal('themeGlowOpacity')) ?? 0.3,
    };
  },

  async saveTheme() {
    const theme = this._readThemeForm();
    ThemeEngine.applyTheme(theme);
    await window.pomodoroAPI.setTheme(theme);
    showToast('主题已保存 ✅');
  },

  async resetTheme() {
    const theme = await window.pomodoroAPI.resetTheme();
    ThemeEngine.applyTheme(theme);
    this.populateThemeSettings();
    showToast('已恢复默认主题');
  },

  // ===== Quotes Tab =====
  populateQuotesTab() {
    this._setVal('quoteStrategy', QuotesEngine.config.rotationStrategy || 'per-session');
    this.renderQuoteList();
  },

  renderQuoteList() {
    const container = document.getElementById('quoteList');
    if (!container) return;

    const userQuotes = QuotesEngine.getUserQuotes();
    const builtInCount = QuotesEngine.getBuiltInCount();

    if (userQuotes.length === 0) {
      container.innerHTML = `<div style="color:var(--sub);font-size:13px;text-align:center;padding:12px">暂无自定义名言<br>内置名言库: ${builtInCount} 条</div>`;
      return;
    }

    container.innerHTML = userQuotes.map(q => `
      <div class="quote-item">
        <div>
          <div class="quote-item-text">${this._esc(q.text)}</div>
          ${q.author ? `<div class="quote-item-author">— ${this._esc(q.author)}</div>` : ''}
        </div>
        <button class="quote-item-del" data-id="${q.id}" title="删除">✕</button>
      </div>
    `).join('');

    // Bind delete buttons
    container.querySelectorAll('.quote-item-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        await QuotesEngine.removeUserQuote(id);
        this.renderQuoteList();
        QuotesEngine.pickRandom();
        App.updateQuoteDisplay();
      });
    });

    // Show count
    const countEl = document.getElementById('quoteCountInfo');
    if (countEl) countEl.textContent = `自定义: ${userQuotes.length} 条 | 内置: ${builtInCount} 条`;
  },

  async addQuote() {
    const textEl = document.getElementById('newQuoteText');
    const authorEl = document.getElementById('newQuoteAuthor');
    const langEl = document.getElementById('newQuoteLang');

    const text = textEl?.value?.trim();
    if (!text) { showToast('请输入名言内容'); return; }
    if (text.length > 200) { showToast('名言内容不能超过200字'); return; }

    const author = authorEl?.value?.trim() || '';
    const lang = langEl?.value || 'zh';

    await QuotesEngine.addUserQuote(text, author, lang);
    if (textEl) textEl.value = '';
    if (authorEl) authorEl.value = '';
    this.renderQuoteList();
    showToast('名言已添加 ✅');
  },

  // ===== Helpers =====
  _setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  },
  _setCheck(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = checked;
  },
  _getVal(id) {
    return document.getElementById(id)?.value;
  },
  _esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
