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
