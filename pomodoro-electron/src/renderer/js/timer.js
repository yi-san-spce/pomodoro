/* ====== Timer Module — Core state machine ====== */

const RING_CIRCUMFERENCE = 2 * Math.PI * 120; // ~753.98

const Timer = {
  mode: 'work',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  completedTomatoes: 0,
  animFrameId: null,
  lastTick: null,
  settings: { work: 25, break: 5, long: 15, longInterval: 4, volume: 0.7, autoStartNext: true },

  // Callbacks (set by app.js)
  onTick: null,
  onComplete: null,
  onModeSwitch: null,
  onStateChange: null,

  getModeDuration() {
    if (this.mode === 'work') return this.settings.work * 60;
    if (this.mode === 'break') return this.settings.break * 60;
    return this.settings.long * 60;
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },

  getProgress() {
    const total = this.getModeDuration();
    return total > 0 ? (total - this.remainingSeconds) / total : 1;
  },

  startPause() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    this.isRunning = true;
    this.lastTick = null;
    this.animFrameId = requestAnimationFrame((t) => this._tick(t));
    if (this.onStateChange) this.onStateChange();
  },

  pause() {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
    this.lastTick = null;
    if (this.onStateChange) this.onStateChange();
  },

  reset() {
    this.pause();
    this.remainingSeconds = this.getModeDuration();
    if (this.onTick) this.onTick();
  },

  skip() {
    this.pause();
    const wasWork = this.mode === 'work';

    if (wasWork) {
      const nextCount = this.completedTomatoes + 1;
      this.switchMode(nextCount % this.settings.longInterval === 0 ? 'long' : 'break');
    } else {
      this.switchMode('work');
    }
    this.remainingSeconds = this.getModeDuration();
    if (this.onTick) this.onTick();
  },

  switchMode(mode) {
    this.pause();
    this.mode = mode;
    this.remainingSeconds = this.getModeDuration();
    this.lastTick = null;
    if (this.onModeSwitch) this.onModeSwitch(mode);
    if (this.onTick) this.onTick();
  },

  _tick(now) {
    if (!this.isRunning) return;

    if (this.lastTick === null) this.lastTick = now;
    const elapsed = (now - this.lastTick) / 1000;

    if (elapsed >= 1) {
      this.lastTick = now;
      const prevSec = this.remainingSeconds;
      this.remainingSeconds = Math.max(0, this.remainingSeconds - Math.floor(elapsed));

      // Tick sound for last 3 seconds
      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        if (this._onTickSound) this._onTickSound();
      }

      if (this.onTick) this.onTick();

      if (this.remainingSeconds <= 0 && prevSec > 0) {
        this._complete();
        return;
      }
    }

    this.animFrameId = requestAnimationFrame((t) => this._tick(t));
  },

  _complete() {
    this.pause();

    if (this.mode === 'work') {
      this.completedTomatoes++;
      const isLongBreak = this.completedTomatoes % this.settings.longInterval === 0;
      if (this.onComplete) this.onComplete('work', isLongBreak);

      this.switchMode(isLongBreak ? 'long' : 'break');

      if (this.settings.autoStartNext) {
        setTimeout(() => this.start(), 800);
      }
    } else {
      if (this.onComplete) this.onComplete(this.mode, false);
      this.switchMode('work');

      if (this.settings.autoStartNext) {
        setTimeout(() => this.start(), 800);
      }
    }
  },

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    if (!this.isRunning) {
      this.remainingSeconds = this.getModeDuration();
      if (this.onTick) this.onTick();
    }
  },

  // For tray IPC
  trayTogglePlay() {
    this.startPause();
  },

  traySkip() {
    this.skip();
  },
};

// Expose for tray IPC
window.__trayTogglePlay = () => Timer.trayTogglePlay();
window.__traySkip = () => Timer.traySkip();
