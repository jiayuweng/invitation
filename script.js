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


// Seating lookup: reads only the fields needed for a guest's table number.
const seatLookupForm = document.getElementById('seatLookupForm');
const guestNameInput = document.getElementById('guestName');
const seatLookupStatus = document.getElementById('seatLookupStatus');
const seatLookupResult = document.getElementById('seatLookupResult');
const seatingSheetUrl = 'https://docs.google.com/spreadsheets/d/17S-YGI8hcYBZZfNovM09SyP-h9Yv5JJi3XuZLW_je-0/gviz/tq?tqx=out:json&gid=2140433026';
let seatingGuestsPromise = null;

const normaliseName = (value) => String(value || '').replace(/[\s　]+/g, '').toLocaleLowerCase('zh-Hant');

function showSeatStatus(message, type = '') {
  seatLookupStatus.textContent = message;
  seatLookupStatus.className = `seat-lookup__status${type ? ` is-${type}` : ''}`;
}

function tableLabel(value) {
  const number = String(value ?? '').trim();
  return number ? `第 ${number} 桌` : '桌號尚未安排';
}

function parseGuestSheet(payload) {
  const data = JSON.parse(payload.replace(/^\/\*O_o\*\/\n/, '').replace(/^google\.visualization\.Query\.setResponse\(/, '').replace(/\);\s*$/, ''));
  const table = data?.table;
  if (!table?.cols || !table?.rows) throw new Error('座位資料格式無法辨識');
  const headers = table.cols.map((column) => column.label || column.id);
  const valueAt = (row, field) => {
    const cell = row.c[headers.indexOf(field)];
    return cell?.v ?? '';
  };
  return table.rows
    .map((row) => ({
      name: valueAt(row, 'Name'),
      nameOverride: valueAt(row, 'NameOverride'),
      formName: valueAt(row, 'FormName'),
      tableId: valueAt(row, 'Table_ID'),
    }))
    .filter((guest) => guest.name && guest.tableId !== '');
}

function getSeatingGuests() {
  if (!seatingGuestsPromise) {
    seatingGuestsPromise = fetch(seatingSheetUrl)
      .then((response) => {
        if (!response.ok) throw new Error('座位資料暫時無法讀取');
        return response.text();
      })
      .then(parseGuestSheet);
  }
  return seatingGuestsPromise;
}

function renderSeatMatches(matches) {
  seatLookupResult.replaceChildren();
  matches.forEach((guest) => {
    const item = document.createElement('p');
    item.className = 'seat-lookup__table';
    const name = document.createElement('span');
    name.textContent = guest.name;
    const table = document.createElement('strong');
    table.textContent = tableLabel(guest.tableId);
    item.append(name, table);
    seatLookupResult.append(item);
  });
  seatLookupResult.hidden = false;
}

seatLookupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = normaliseName(guestNameInput.value);
  seatLookupResult.hidden = true;
  seatLookupResult.replaceChildren();

  if (!query) {
    showSeatStatus('請先輸入受邀姓名。', 'error');
    guestNameInput.focus();
    return;
  }

  showSeatStatus('正在查詢座位…', 'loading');
  try {
    const guests = await getSeatingGuests();
    const matches = guests.filter((guest) =>
      [guest.name, guest.nameOverride, guest.formName].some((name) => normaliseName(name) === query)
    );
    if (!matches.length) {
      showSeatStatus('找不到此姓名，請確認輸入是否與邀請函相同。', 'error');
      return;
    }
    showSeatStatus(matches.length > 1 ? '找到以下座位安排：' : '您的座位安排如下：', 'success');
    renderSeatMatches(matches);
  } catch (error) {
    console.error('Seat lookup failed:', error);
    showSeatStatus('目前無法讀取座位資料，請稍後再試。', 'error');
  }
});
