/* ====== App Bootstrap — Wires all modules, DOM bindings, keyboard shortcuts ====== */

const App = {
  dom: {},

  async init() {
    // Cache DOM refs
    this.dom = {
      app: document.getElementById('app'),
      timeDisplay: document.getElementById('timeDisplay'),
      stateLabel: document.getElementById('stateLabel'),
      ring: document.getElementById('ring'),
      btnPlay: document.getElementById('btnPlay'),
      btnReset: document.getElementById('btnReset'),
      btnSkip: document.getElementById('btnSkip'),
      btnSettings: document.getElementById('btnSettings'),
      btnPin: document.getElementById('btnPin'),
      tomatoes: document.getElementById('tomatoes'),
      quoteText: document.getElementById('quoteText'),
      quoteAuthor: document.getElementById('quoteAuthor'),
      tabBtns: document.querySelectorAll('.tab'),
    };

    // Load persisted data
    const [settings, theme, quotesConfig] = await Promise.all([
      window.pomodoroAPI.getSettings(),
      window.pomodoroAPI.getTheme(),
      window.pomodoroAPI.getQuotes(),
    ]);

    // Apply theme
    ThemeEngine.applyTheme(theme);

    // Init quotes
    QuotesEngine.config = quotesConfig;
    await QuotesEngine.init();

    // Init timer with settings
    Timer.updateSettings(settings);
    this.updateDisplay();
    this.updatePlayButton();
    this.updateTomatoes();
    this.updateQuoteDisplay();
    this.updatePinButton();

    // Wire timer callbacks
    Timer.onTick = () => this.updateDisplay();
    Timer.onComplete = (completedMode, isLong) => this._onSessionComplete(completedMode, isLong);
    Timer.onModeSwitch = (mode) => this._onModeSwitch(mode);
    Timer.onStateChange = () => {
      this.updatePlayButton();
      window.pomodoroAPI.updateTrayPlayState(Timer.isRunning);
    };

    // Audio callbacks
    Timer._onTickSound = () => playTickSound();

    // Bind events
    this.bindEvents();
    this.updateModeClass();

    // Restore always-on-top button state
    this.updatePinButton();
  },

  bindEvents() {
    // Play/Pause
    this.dom.btnPlay?.addEventListener('click', () => Timer.startPause());
    this.dom.btnReset?.addEventListener('click', () => Timer.reset());
    this.dom.btnSkip?.addEventListener('click', () => Timer.skip());

    // Settings
    this.dom.btnSettings?.addEventListener('click', () => SettingsPanel.open('timer'));

    // Always on top
    this.dom.btnPin?.addEventListener('click', async () => {
      const state = await window.pomodoroAPI.toggleAlwaysOnTop();
      this.updatePinButton(state);
    });

    // Mode tabs
    this.dom.tabBtns?.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        if (mode && mode !== Timer.mode) {
          Timer.switchMode(mode);
          this.updateModeClass();
        }
      });
    });

    // Quote refresh
    document.getElementById('btnRefreshQuote')?.addEventListener('click', () => {
      QuotesEngine.pickRandom();
      this.updateQuoteDisplay();
    });

    // Quote edit (opens settings to quotes tab)
    document.getElementById('btnEditQuotes')?.addEventListener('click', () => {
      SettingsPanel.open('quotes');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (document.getElementById('settingsOverlay')?.classList.contains('open')) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          Timer.startPause();
          break;
        case 'KeyR':
          Timer.reset();
          break;
        case 'ArrowRight':
          Timer.skip();
          break;
        case 'Digit1':
          Timer.switchMode('work');
          this.updateModeClass();
          break;
        case 'Digit2':
          Timer.switchMode('break');
          this.updateModeClass();
          break;
        case 'Digit3':
          Timer.switchMode('long');
          this.updateModeClass();
          break;
      }
    });
  },

  // ===== Update Functions =====
  updateDisplay() {
    if (this.dom.timeDisplay) {
      this.dom.timeDisplay.textContent = Timer.formatTime(Timer.remainingSeconds);
    }
    if (this.dom.ring) {
      const offset = RING_CIRCUMFERENCE * Timer.getProgress();
      this.dom.ring.style.strokeDashoffset = offset;
    }
    if (this.dom.stateLabel) {
      if (Timer.mode === 'work') this.dom.stateLabel.textContent = '专注中';
      else if (Timer.mode === 'break') this.dom.stateLabel.textContent = '休息中';
      else this.dom.stateLabel.textContent = '长休中';
    }
  },

  updatePlayButton() {
    if (this.dom.btnPlay) {
      this.dom.btnPlay.textContent = Timer.isRunning ? '⏸' : '▶';
    }
  },

  updateModeClass() {
    const app = this.dom.app;
    if (!app) return;
    app.className = 'app';
    if (Timer.mode === 'work') app.classList.add('work-mode');
    else if (Timer.mode === 'break') app.classList.add('break-mode');
    else app.classList.add('long-mode');

    // Update tabs
    this.dom.tabBtns?.forEach(t => {
      t.classList.toggle('active', t.dataset.mode === Timer.mode);
    });
  },

  updateTomatoes() {
    const container = this.dom.tomatoes;
    if (!container) return;
    const total = Timer.settings.longInterval;
    const inCycle = Timer.completedTomatoes % total || total;
    // Show: all done if completedTomatoes % total === 0 (but also show all empty initially)
    const isRoundComplete = Timer.completedTomatoes > 0 && Timer.completedTomatoes % total === 0;

    let html = '';
    for (let i = 0; i < total; i++) {
      const isDone = isRoundComplete ? true : (i < inCycle);
      html += `<span class="tomato${isDone ? ' done' : ''}">🍅</span>`;
    }
    container.innerHTML = html;
  },

  updateQuoteDisplay() {
    const quote = QuotesEngine.getCurrent();
    if (!quote) return;

    if (this.dom.quoteText) {
      this.dom.quoteText.textContent = `"${quote.text}"`;
    }
    if (this.dom.quoteAuthor) {
      this.dom.quoteAuthor.textContent = quote.author ? `— ${quote.author}` : '';
    }
  },

  updatePinButton(state) {
    if (!this.dom.btnPin) return;
    const isOnTop = state !== undefined ? state : false;
    this.dom.btnPin.classList.toggle('active', isOnTop);
    this.dom.btnPin.title = isOnTop ? '取消置顶' : '窗口置顶';
  },

  // ===== Session Completed =====
  _onSessionComplete(completedMode, isLong) {
    playFinishSound();

    if (completedMode === 'work') {
      this.updateTomatoes();
      // Animate last tomato
      const toms = this.dom.tomatoes?.querySelectorAll('.tomato.done');
      if (toms?.length) toms[toms.length - 1].classList.add('anim');

      const msg = isLong
        ? '🍅 番茄完成！该长休了～'
        : '🍅 番茄完成！休息一下吧～';
      notify('🍅 番茄完成', msg);
    } else {
      const restType = completedMode === 'long' ? '长休' : '休息';
      notify('⏰ 时间到', `${restType}结束，继续加油！`);
    }

    // Rotate quote
    QuotesEngine.onSessionComplete();
    this.updateQuoteDisplay();
  },

  _onModeSwitch(mode) {
    this.updateModeClass();
    this.updateQuoteDisplay();
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Also init settings panel (lazy)
  SettingsPanel.init();
});
