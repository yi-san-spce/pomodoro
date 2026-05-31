/* ====== Audio Module — Web Audio API sound synthesis ====== */

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBeep(freq, duration, type = 'sine', vol = 1) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    // Respect timer's volume setting (0–1), scaled down by 0.3 for comfort
    const masterVol = (typeof Timer !== 'undefined' && Timer.settings)
      ? Timer.settings.volume
      : 0.7;
    gain.gain.setValueAtTime(vol * masterVol * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silent */ }
}

function playFinishSound() {
  playBeep(523, 0.15, 'sine', 1);
  setTimeout(() => playBeep(659, 0.15, 'sine', 1), 150);
  setTimeout(() => playBeep(784, 0.15, 'sine', 1), 300);
  setTimeout(() => playBeep(1047, 0.4, 'sine', 1), 450);
}

function playTickSound() {
  playBeep(1000, 0.05, 'sine', 0.4);
}

// Warm up audio context on first user interaction
document.addEventListener('click', function warmAudio() {
  try { getAudioCtx(); } catch (e) {}
}, { once: true });
