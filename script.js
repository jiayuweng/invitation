const screen = document.getElementById('envelopeScreen');
const envelope = document.getElementById('envelope');
const invitation = document.getElementById('invitation');

function openInvitation() {
  if (envelope.classList.contains('unseal')) return;
  envelope.classList.add('unseal');
  setTimeout(() => { screen.classList.add('opened'); invitation.classList.remove('is-hidden'); invitation.setAttribute('aria-hidden', 'false'); }, 1150);
}
envelope.addEventListener('click', openInvitation);
envelope.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openInvitation(); } });
setTimeout(openInvitation, 700);

const target = new Date('2026-11-22T12:00:00+08:00').getTime();
function tick() {
  const diff = Math.max(0, target - Date.now());
  const units = [[86400000, 'days', 3], [3600000, 'hours', 2], [60000, 'minutes', 2], [1000, 'seconds', 2]];
  let remain = diff;
  units.forEach(([ms, id, digits]) => { const value = Math.floor(remain / ms); remain %= ms; const el = document.getElementById(id); const next = String(value).padStart(digits, '0'); if (el.textContent !== next) { el.textContent = next; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; } });
}
tick(); setInterval(tick, 1000);

// Original gentle melody generated in-browser with Web Audio; no external track required.
const musicToggle = document.getElementById('musicToggle');
let musicContext = null;
let musicTimer = null;
let musicStep = 0;
let musicPlaying = false;
const melody = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
function playMusicNote() {
  if (!musicContext || !musicPlaying) return;
  const now = musicContext.currentTime;
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = melody[musicStep % melody.length];
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
  oscillator.connect(gain).connect(musicContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.56);
  musicStep += 1;
}
function toggleMusic() {
  if (!musicContext) musicContext = new (window.AudioContext || window.webkitAudioContext)();
  if (musicContext.state === 'suspended') musicContext.resume();
  musicPlaying = !musicPlaying;
  if (musicToggle) {
    musicToggle.classList.toggle('is-playing', musicPlaying);
    musicToggle.setAttribute('aria-pressed', String(musicPlaying));
    musicToggle.setAttribute('aria-label', musicPlaying ? '暫停背景音樂' : '播放背景音樂');
  }
  if (musicPlaying) { playMusicNote(); musicTimer = setInterval(playMusicNote, 620); }
  else { clearInterval(musicTimer); musicTimer = null; }
}
document.addEventListener('pointerdown', (event) => {
  if (!musicPlaying) { try { toggleMusic(); } catch (error) {} }
}, { once: true, passive: true });
