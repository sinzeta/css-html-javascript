/* Última — la última y a casa. Vanilla JS, sin dependencias. */
(() => {
'use strict';

/* ================= utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const MIN = 60000;
const hhmm = t => new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const nf = (n, d = 0) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = n => nf(n, n % 1 ? 2 : 0) + ' €';
const fmtDist = m => m == null ? '—' : m < 75 ? 'en casa' : m < 950 ? `~${Math.round(m / 50) * 50} m` : `~${nf(m / 1000, 1)} km`;
const fmtCd = ms => {
  const s = Math.floor(Math.abs(ms) / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (ms < 0 ? '+' : '') + h + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
};
const fmtDur = ms => {
  const m = Math.round(Math.abs(ms) / MIN), h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
};
const haversine = (a, b) => {
  const R = 6371000, r = x => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= iconos ================= */
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d.split('|').map(p => `<path d="${p}"/>`).join('')}${extra}</svg>`;
const I = {
  moon: svg('M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z'),
  bars: svg('M5 20V11|M12 20V4|M19 20v-6'),
  sliders: svg('M4 7h9|M19 7h1|M4 17h1|M11 17h9', '<circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>'),
  home: svg('M4 11l8-7 8 7|M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9|M10 20v-6h4v6'),
  pin: svg('M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z', '<circle cx="12" cy="9.5" r="2.5"/>'),
  route: svg('M6 19h8a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h8', '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="3" r="0.5"/>'),
  check: svg('M5 12.500l4.500 4.500L19 7'),
  bell: svg('M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15z|M10 21h4'),
  alert: svg('M12 4l9 16H3z|M12 10v4|M12 17.500v.01'),
  flame: svg('M12 3c1 4 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z'),
  send: svg('M21 3L10 14|M21 3l-7 18-4-7-7-4z'),
  star: svg('M12 3l2.700 5.600 6.100.800-4.500 4.300 1.100 6.100L12 17l-5.400 2.800 1.100-6.100L3.200 9.400l6.100-.800z'),
  drop: svg('M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z'),
  clock: svg('M12 7v5l3 2', '<circle cx="12" cy="12" r="9"/>'),
  lock: svg('M7 11V8a5 5 0 0 1 10 0v3|M6 11h12v9H6z'),
};
const LOGO = `<svg viewBox="0 0 512 512" class="logo" aria-hidden="true"><defs><linearGradient id="lb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262B66"/><stop offset=".6" stop-color="#141733"/><stop offset="1" stop-color="#0A0C18"/></linearGradient><linearGradient id="ll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC857"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient><clipPath id="lg"><path d="M150 150h212l-22 226a22 22 0 0 1-22 20H194a22 22 0 0 1-22-20z"/></clipPath></defs><rect width="512" height="512" fill="url(#lb)"/><g clip-path="url(#lg)"><path d="M120 262q34-18 68 0t68 0 68 0 68 0v160H120z" fill="url(#ll)"/></g><path d="M286 176a42 42 0 1 0 34 66 34 34 0 0 1-34-66z" fill="#F5EFE0"/><path d="M150 150h212l-22 226a22 22 0 0 1-22 20H194a22 22 0 0 1-22-20z" fill="none" stroke="#F5EFE0" stroke-width="18" stroke-linejoin="round"/></svg>`;

/* ================= catálogo ================= */
// g = gramos de alcohol puro (ml × grados × 0,789)
const CAT = [
  { id: 'cana', n: 'Caña', g: 7.9, p: 2, d: 'M7 4h10l-1.200 16H8.200z|M7.400 8h9.200' },
  { id: 'tercio', n: 'Tercio', g: 13, p: 3, d: 'M10 2h4v4l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z|M8 13h8' },
  { id: 'pinta', n: 'Pinta', g: 19.7, p: 5, d: 'M5 6h11v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z|M16 9h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2|M5 10h11' },
  { id: 'vino', n: 'Vino', g: 15.4, p: 3.5, d: 'M7 3h10c0 5-1.500 8-5 8S7 8 7 3z|M12 11v9|M8 20h8' },
  { id: 'vermut', n: 'Vermut', g: 11.8, p: 3, d: 'M6 5h12l-1.500 9a4.500 4.500 0 0 1-9 0z|M12 18.500V21|M9 21h6' },
  { id: 'cubata', n: 'Cubata', g: 15.8, p: 8, d: 'M7 6h10l-1 14H8z|M13 6l2-4|M7.500 11h9' },
  { id: 'coctel', n: 'Cóctel', g: 18.9, p: 10, d: 'M4 4h16l-8 9z|M12 13v7|M8 20h8' },
  { id: 'chupito', n: 'Chupito', g: 9.5, p: 2.5, d: 'M8 9h8l-1 10H9z|M8.400 13h7.200' },
  { id: 'agua', n: 'Agua', g: 0, p: 0, d: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z' },
  { id: 'refresco', n: 'Sin alcohol', g: 0, p: 2.5, d: 'M8 4h8l1 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7z|M7 7h10' },
];
const cat = id => CAT.find(c => c.id === id) || CAT[0];

/* ================= estado ================= */
const KEY = 'ultima.v1';
const DEF = {
  profile: { name: '', weight: 70, sex: 'x', home: null, radius: 250, contact: { name: '', phone: '' }, onboarded: false },
  prefs: { curfew: '02:00', limit: 4, checkin: 45, alarmEvery: 2, sound: 'sirena', vibrate: true, prices: {} },
  night: null, history: [],
};
let S = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    return { ...DEF, ...s, profile: { ...DEF.profile, ...s.profile, contact: { ...DEF.profile.contact, ...(s.profile || {}).contact } }, prefs: { ...DEF.prefs, ...s.prefs } };
  } catch { return structuredClone(DEF); }
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const price = id => S.prefs.prices[id] ?? cat(id).p;
const alc = n => n.drinks.filter(d => d.g > 0);
const sexR = () => ({ m: .68, f: .55, x: .62 }[S.profile.sex] || .62);
function bac(drinks, now = Date.now()) {            // g/L en sangre, estimación de Widmark
  const a = drinks.filter(d => d.g > 0); if (!a.length) return { v: 0, sober: null };
  const peak = a.reduce((s, d) => s + d.g, 0) / ((+S.profile.weight || 70) * sexR());
  const t0 = Math.min(...a.map(d => d.t));
  return { v: Math.max(0, peak - .15 * (now - t0) / 3600000), sober: t0 + peak / .15 * 3600000 };
}
const isOk = h => !h.alarm && h.outcome !== 'surrender';
function streak() { let s = 0; for (const h of S.history) { if (isOk(h)) s++; else break; } return s; }

/* ================= toast / hojas ================= */
let toastT;
function toast(msg, action, fn) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action)}</button>` : ''}`;
  if (action) t.querySelector('button').onclick = () => { t.classList.remove('show'); fn(); };
  t.classList.add('show'); clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), action ? 5000 : 3200);
}
let sheetOpen = null;
function openSheet(name, html, { modal = false } = {}) {
  const r = $('#sheet-root'); sheetOpen = name;
  r.innerHTML = `<div class="backdrop" ${modal ? '' : 'data-act="closeSheet"'}></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('open')));
}
function closeSheet() {
  const r = $('#sheet-root'); if (!sheetOpen) return;
  sheetOpen = null; r.classList.remove('open');
  setTimeout(() => { if (!sheetOpen) r.innerHTML = ''; }, 450);
}

/* ================= ubicación (aproximada) ================= */
const r3 = x => Math.round(x * 1000) / 1000;      // ~100 m: nunca guardamos más precisión
const Geo = {
  last: null, err: null, lastTry: 0,
  get() {
    Geo.lastTry = Date.now();
    return new Promise(res => {
      if (!navigator.geolocation) { Geo.err = 'unsupported'; return res(null); }
      navigator.geolocation.getCurrentPosition(p => {
        Geo.last = { lat: r3(p.coords.latitude), lon: r3(p.coords.longitude), t: Date.now() }; Geo.err = null; res(Geo.last);
      }, e => { Geo.err = e.code === 1 ? 'denied' : 'unavailable'; res(null); },
      { enableHighAccuracy: false, maximumAge: 20000, timeout: 15000 });
    });
  },
  dist() { const h = S.profile.home; return h && Geo.last ? haversine(Geo.last, h) : null; },
  fresh(ms = 5 * MIN) { return Geo.last && Date.now() - Geo.last.t < ms; },
  atHome() { const d = Geo.dist(); return d != null && d <= S.profile.radius; },
};
const mapsUrl = () => { const h = S.profile.home; return h ? `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}&travelmode=walking` : 'https://www.google.com/maps'; };
const walkMs = m => m * 1.3 / 75 * MIN;            // 4,5 km/h con rodeo del 30 %

/* ================= sonido ================= */
const Snd = {
  ctx: null, nodes: [], until: 0,
  init() { try { Snd.ctx = Snd.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (Snd.ctx.state === 'suspended') Snd.ctx.resume(); } catch {} },
  stop() { Snd.nodes.forEach(n => { try { n.stop(); } catch {} }); Snd.nodes = []; Snd.until = 0; },
  get ringing() { return Date.now() < Snd.until; },
  tone(type, f, t0, dur, vol) {
    const c = Snd.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .02); g.gain.setValueAtTime(vol, t0 + dur - .04); g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + .05); Snd.nodes.push(o); return o;
  },
  alarm(sec = 30, kind = S.prefs.sound) {
    Snd.init(); if (!Snd.ctx) return; Snd.stop();
    const t = Snd.ctx.currentTime + .05; Snd.until = Date.now() + sec * 1000;
    if (kind === 'pitidos') for (let i = 0; i < sec * 2.5; i++) Snd.tone('square', i % 4 === 3 ? 1320 : 990, t + i * .4, .22, .22);
    else if (kind === 'campana') for (let i = 0; i < sec; i++) { Snd.tone('sine', 660, t + i, .9, .4); Snd.tone('sine', 1318, t + i, .5, .2); Snd.tone('triangle', 1975, t + i, .25, .1); }
    else {
      const o = Snd.tone('sawtooth', 620, t, sec, .2);
      for (let i = 0; i < sec; i++) { o.frequency.linearRampToValueAtTime(1180, t + i + .5); o.frequency.linearRampToValueAtTime(620, t + i + 1); }
    }
  },
  chime(up = true) {
    Snd.init(); if (!Snd.ctx) return; const t = Snd.ctx.currentTime + .02;
    (up ? [660, 880, 1175] : [880, 660]).forEach((f, i) => Snd.tone('sine', f, t + i * .13, .28, .18));
  },
};
const buzz = p => { if (S.prefs.vibrate && navigator.vibrate) try { navigator.vibrate(p); } catch {} };

/* ================= notificaciones ================= */
let swReg = null;
async function notify(title, body, tag = 'ultima') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const o = { body, tag, renotify: true, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [200, 100, 200] };
  try { if (swReg) await swReg.showNotification(title, o); else new Notification(title, o); } catch {}
}
let wake = null;
async function wakeOn() { try { wake = wake || await navigator.wakeLock?.request('screen'); wake?.addEventListener('release', () => wake = null); } catch {} }
function wakeOff() { try { wake?.release(); } catch {} wake = null; }

/* ================= lógica de la noche ================= */
function curfewTs(str, from = Date.now()) {
  const [h, m] = str.split(':').map(Number), d = new Date(from); d.setHours(h, m, 0, 0);
  if (d.getTime() <= from) d.setDate(d.getDate() + 1);
  return d.getTime();
}
function startNight(curfew, limit, checkin) {
  const now = Date.now();
  S.night = { id: uid(), start: now, curfew: curfewTs(curfew, now), limit, checkin, drinks: [], lastReport: now, lastNag: 0, warned: {}, alarm: null, alarmEver: null, away: false };
  S.prefs.curfew = curfew; S.prefs.limit = limit; S.prefs.checkin = checkin; save();
  Snd.init(); Snd.chime();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  if (S.profile.home) Geo.get().then(tick);
  closeSheet(); go('home');
}
function addDrink(id, force) {
  const n = S.night, c = cat(id); if (!n) return;
  const count = alc(n).length;
  if (c.g > 0 && count >= n.limit && !force && !n.alarm) return openSheet('over', `
    <h2>Esa ya rebasa tu límite</h2>
    <p class="lead">Pactaste ${n.limit} y llevas ${count}. Si la apuntas, la alarma sonará cada ${S.prefs.alarmEvery} min hasta que estés cerca de casa.</p>
    <div class="stack"><button class="btn mint block" data-act="closeSheet">No la pido</button>
    <button class="btn ghost block" data-act="forceDrink" data-id="${id}">La he pedido: apúntala</button></div>`);
  const d = { id: uid(), type: id, t: Date.now(), g: c.g, p: price(id) };
  n.drinks.push(d); n.lastReport = Date.now(); save();
  buzz(20); refreshNight(true);
  const k = alc(n).length;
  let msg = `${c.n} apuntada`;
  if (c.g > 0) {
    const sinceWater = []; for (let i = n.drinks.length - 1; i >= 0 && n.drinks[i].type !== 'agua'; i--) if (n.drinks[i].g > 0) sinceWater.push(1);
    if (k === n.limit) { msg = 'Límite alcanzado. Ni una más.'; Snd.chime(false); notify('Límite alcanzado', `Llevas ${k} de ${n.limit}. La siguiente dispara la alarma.`, 'limit'); }
    else if (k === n.limit - 1) msg = 'Te queda una. La última.';
    else if (sinceWater.length >= 2 && k < n.limit) msg = 'Dos seguidas: ahora toca un vaso de agua.';
  }
  toast(msg, 'Deshacer', () => removeDrink(d.id));
  tick();
}
function removeDrink(id) {
  const n = S.night; if (!n) return;
  n.drinks = n.drinks.filter(d => d.id !== id); save(); refreshNight();
}
function triggerAlarm(reason) {
  const n = S.night; if (!n || n.alarm) return;
  n.alarm = { reason, since: Date.now(), nextRing: 0, min: false }; n.alarmEver = n.alarmEver || reason; save();
  if (sheetOpen) closeSheet();
  document.body.classList.add('alarming'); wakeOn(); Geo.get().then(tick);
}
function ring() {
  const n = S.night; if (!n?.alarm) return;
  n.alarm.nextRing = Date.now() + S.prefs.alarmEvery * MIN; n.alarm.min = false; save();
  Snd.alarm(30); buzz([600, 200, 600, 200, 600, 200, 1200]);
  notify('¡A casa!', n.alarm.reason === 'limit' ? 'Has rebasado tu límite. La alarma sigue hasta que llegues.' : 'Ha pasado tu hora tope. La alarma sigue hasta que llegues.', 'alarm');
  renderAlarm();
}
function endNight(outcome, verified) {
  const n = S.night; if (!n) return;
  const now = Date.now(), a = alc(n);
  const rec = {
    id: n.id, start: n.start, end: now, curfew: n.curfew, limit: n.limit, count: a.length,
    grams: a.reduce((s, d) => s + d.g, 0), water: n.drinks.filter(d => d.type === 'agua').length,
    spent: n.drinks.reduce((s, d) => s + d.p, 0), outcome, verified: !!verified, alarm: n.alarmEver,
    late: Math.max(0, Math.round((now - n.curfew) / MIN)), sober: bac(n.drinks).sober,
  };
  const before = badges().filter(b => b.got).map(b => b.id);
  S.history.unshift(rec); S.night = null; save();
  Snd.stop(); wakeOff(); buzz(0); $('#toast').classList.remove('show');
  document.body.classList.remove('alarming'); $('#alarm').hidden = true; $('#banner').hidden = true;
  document.documentElement.style.setProperty('--phase', 0);
  go('home');
  const fresh = badges().filter(b => b.got && !before.includes(b.id));
  summary(rec, fresh);
  if (isOk(rec)) { Snd.chime(); confetti(); }
}

/* latido: se ejecuta cada segundo y al volver a primer plano */
function tick() {
  const n = S.night; if (!n) return;
  const now = Date.now(), left = n.curfew - now, count = alc(n).length;

  // ubicación: cada 3 min; cada 20 s con alarma o en los últimos 10 min
  if (S.profile.home && Geo.err !== 'denied' && Geo.err !== 'unsupported') {
    const every = n.alarm || left < 10 * MIN ? 20000 : 3 * MIN;
    if (now - Geo.lastTry > every) Geo.get().then(() => { refreshLive(); });
  }
  const d = Geo.dist();
  if (d != null && d > S.profile.radius && !n.away) { n.away = true; save(); }

  // llegada automática
  if (Geo.fresh(MIN) && Geo.atHome() && (n.alarm || (n.away && now - n.start > 10 * MIN) || left <= 0)) return endNight('home', true);

  // avisos previos
  if (!n.alarm) {
    for (const m of [30, 15, 5]) if (left > 0 && left <= m * MIN && !n.warned[m]) {
      n.warned[m] = 1; save(); Snd.chime(false); buzz([150, 80, 150]);
      const t = m === 30 ? 'Última ronda' : `Quedan ${m} minutos`;
      notify(t, `Tu tope es a las ${hhmm(n.curfew)}. Ve cerrando la noche.`, 'warn'); toast(`${t}: tope a las ${hhmm(n.curfew)}`);
    }
    if (d != null && d > S.profile.radius && !n.warned.leave && left > 0 && left <= walkMs(d)) {
      n.warned.leave = 1; save(); Snd.chime(false);
      notify('Sal ya para llegar a tiempo', `Estás a ${fmtDist(d)} de casa.`, 'leave'); toast('Sal ya: es lo que tardas andando a casa');
    }
    // recordatorio de reporte
    if (n.checkin && now - n.lastReport > n.checkin * MIN) {
      if (sheetOpen !== 'checkin' && !sheetOpen) checkinSheet();
      if (now - n.lastNag > 10 * MIN) { n.lastNag = now; save(); Snd.chime(); buzz(200); notify('¿Cuántas llevas?', `Hace ${fmtDur(now - n.lastReport)} que no apuntas nada.`, 'checkin'); }
    }
    if (left <= 0) triggerAlarm('curfew'); else if (count > n.limit) triggerAlarm('limit');
  }
  if (n.alarm && now >= n.alarm.nextRing) ring();
  refreshLive();
}

/* ================= vistas ================= */
let view = 'home';
function go(v) {
  view = v; const app = $('#app');
  app.innerHTML = !S.profile.onboarded ? vOnboard() : v === 'history' ? vHistory() : v === 'settings' ? vSettings() : S.night ? vNight() : vIdle();
  app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
  const tabs = $('#tabs'); tabs.hidden = !S.profile.onboarded;
  tabs.innerHTML = [['home', 'Noche', I.moon], ['history', 'Historial', I.bars], ['settings', 'Ajustes', I.sliders]]
    .map(([k, l, i]) => `<button data-act="tab" data-v="${k}" class="${k === view ? 'on' : ''}" aria-label="${l}">${i}<span>${l}</span></button>`).join('');
  scrollTo(0, 0);
  if (S.night && v === 'home') refreshNight();
}
const topBar = right => `<div class="top"><div class="brand">${LOGO}<span>última<i>.</i></span></div>${right || ''}</div>`;

/* ---- bienvenida ---- */
const ob = { step: 0, name: '', home: null };
let geoResults = [], homeCb = null;
function homePicker(cur) {
  return `${cur ? `<div class="homeok">${I.check}<span><b>Casa guardada</b><br><span class="mute">${esc(cur.label)}</span></span></div>` : ''}
    <button class="btn block ${cur ? '' : 'primary'}" data-act="homeHere">${I.pin} Estoy en casa: usar mi ubicación</button>
    <form class="row" data-form="homeSearch"><input class="input grow" name="q" placeholder="o busca tu calle y ciudad" autocomplete="street-address"><button class="btn">Buscar</button></form>
    <div class="results" id="georesults"></div>
    <p class="small mute">Solo se guarda un punto aproximado (~100 m) y se queda en tu móvil. La búsqueda de direcciones usa OpenStreetMap.</p>`;
}
function vOnboard() {
  const dots = `<div class="dots">${[0, 1, 2].map(i => `<i class="${i === ob.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (ob.step === 0) return `<div class="ob">${LOGO}
    <div><p class="eyebrow">Bienvenida a última</p><h1>La última<br>y <em>a casa.</em></h1></div>
    <p class="mute">Pon tu hora tope y tu límite de copas antes de salir. Si te pasas, la alarma no calla hasta que estés cerca de casa.</p>
    <label class="field"><span>¿Cómo te llamas?</span><input class="input" id="ob-name" value="${esc(ob.name)}" placeholder="Tu nombre" autocomplete="given-name"></label>
    <div class="row">${dots}<span class="grow"></span><button class="btn primary" data-act="obNext">Seguir</button></div></div>`;
  if (ob.step === 1) return `<div class="ob">
    <div><p class="eyebrow">Paso 2 de 3</p><h1>¿Dónde está <em>casa</em>?</h1></div>
    <p class="mute">Es lo único que apaga la alarma: que el móvil detecte que estás cerca.</p>
    <div class="stack">${homePicker(ob.home)}</div>
    <div class="row">${dots}<span class="grow"></span><button class="btn ${ob.home ? 'primary' : 'ghost'}" data-act="obNext">${ob.home ? 'Seguir' : 'Ahora no'}</button></div></div>`;
  return `<div class="ob">
    <div><p class="eyebrow">Paso 3 de 3</p><h1>Tus normas <em>de siempre</em></h1></div>
    <p class="mute">Podrás cambiarlas cada noche antes de sellar el pacto.</p>
    <label class="field"><span>Hora tope para irte a casa</span><input class="input" type="time" id="ob-curfew" value="${S.prefs.curfew}"></label>
    <div class="field"><span>Límite de copas</span>${stepper('ob-limit', S.prefs.limit, 1, 15, 'copas')}</div>
    <div class="row">${dots}<span class="grow"></span><button class="btn primary" data-act="obDone">Empezar</button></div></div>`;
}
const stepper = (id, v, min, max, unit) => `<div class="stepper"><button type="button" data-act="step" data-t="${id}" data-d="-1" aria-label="Menos">−</button><output id="${id}" data-min="${min}" data-max="${max}" data-unit="${unit}">${v}<small>${unit}</small></output><button type="button" data-act="step" data-t="${id}" data-d="1" aria-label="Más">+</button></div>`;
const stepVal = id => parseInt($('#' + id).textContent, 10);
const seg = (path, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button type="button" data-act="set" data-path="${path}" data-val="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;

/* ---- inicio sin noche ---- */
function vIdle() {
  const h = S.history[0], st = streak(), hr = new Date().getHours();
  const hi = hr < 6 ? 'Buenas noches' : hr < 13 ? 'Buenos días' : hr < 20 ? 'Buenas tardes' : 'Buenas noches';
  return `${topBar()}
  <section class="card hero-idle">
    <svg class="moonglass" viewBox="0 0 150 150" aria-hidden="true"><defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC857"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient><clipPath id="ic"><path d="M40 38h70l-8 82a8 8 0 0 1-8 7H56a8 8 0 0 1-8-7z"/></clipPath></defs>
      <g clip-path="url(#ic)"><g transform="translate(0 82)"><path class="wave" d="M-60 0q15-6 30 0t30 0 30 0 30 0 30 0 30 0 30 0v70H-60z" fill="url(#ig)"/></g></g>
      <path d="M90 50a15 15 0 1 0 12 23 12 12 0 0 1-12-23z" fill="#F5EFE0"/>
      <path class="glass-line" d="M40 38h70l-8 82a8 8 0 0 1-8 7H56a8 8 0 0 1-8-7z"/></svg>
    <p class="eyebrow" style="margin-top:16px">${hi}${S.profile.name ? ', ' + esc(S.profile.name) : ''}</p>
    <h1>¿Sales esta noche?</h1>
    <p>Decide ahora, con la cabeza fría, a qué hora vuelves y cuántas te tomas.</p>
    <button class="btn primary block" data-act="newNight">Preparar la noche</button>
  </section>
  ${S.profile.home ? '' : `<section class="card notice">${I.alert}<span class="grow small">Falta guardar tu casa. Sin ella la alarma no puede saber cuándo has llegado.</span><button class="btn sm" data-act="pickHome">Añadir</button></section>`}
  <div class="grid2">
    <div class="card tile ${st ? 'ok' : ''}"><b>${st}</b><span>${st === 1 ? 'noche cumplida seguida' : 'noches cumplidas seguidas'}</span></div>
    <div class="card tile"><b>${h ? hhmm(h.end) : '—'}</b><span>${h ? `última vuelta · ${h.count} de ${h.limit} copas` : 'aún sin noches'}</span></div>
  </div>
  <section class="card"><ol class="steps">
    <li><span><b>Sella el pacto</b><span class="mute">Hora tope y límite de copas. Durante la noche solo se puede endurecer.</span></span></li>
    <li><span><b>Apunta lo que bebes</b><span class="mute">Un toque por consumición. Si te olvidas, te lo pregunto.</span></span></li>
    <li><span><b>Vuelve a tiempo</b><span class="mute">Si te pasas, suena cada ${S.prefs.alarmEvery} min hasta que estés cerca de casa.</span></span></li>
  </ol></section>`;
}

/* ---- noche activa ---- */
const WAVE = 'M-120 0q15-5 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0v170H-120z';
function vNight() {
  const n = S.night;
  return `${topBar(`<button class="btn sm" data-act="tighten">${I.lock} Pacto</button>`)}
  <section>
    <div class="hero" id="hero">
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5EFE0"/><stop offset="1" stop-color="#FFB43A"/></linearGradient>
        <linearGradient id="lq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC857"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient>
        <linearGradient id="lqo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B7D"/><stop offset="1" stop-color="#D4183A"/></linearGradient>
        <clipPath id="gc"><path d="M102 62h96l-9 124a8 8 0 0 1-8 7h-62a8 8 0 0 1-8-7z"/></clipPath></defs>
        <circle class="ring-track" cx="150" cy="150" r="141"/>
        <circle class="ring-prog" id="ring" cx="150" cy="150" r="141" transform="rotate(-90 150 150)" stroke-dasharray="886" stroke-dashoffset="0"/>
        <g id="moon"><circle cx="150" cy="9" r="9"/></g>
        <g class="glassg"><g clip-path="url(#gc)"><g id="liquid" style="transform:translateY(196px)">
          <path class="wave b" d="${WAVE}" fill="url(#lq)" id="w2"/><path class="wave" d="${WAVE}" fill="url(#lq)" id="w1" transform="translate(0 3)"/>
          <circle class="bub" cx="130" cy="110" r="2.500"/><circle class="bub" cx="158" cy="120" r="2"/><circle class="bub" cx="172" cy="100" r="3"/>
        </g></g><path class="glass-line" d="M102 62h96l-9 124a8 8 0 0 1-8 7h-62a8 8 0 0 1-8-7z"/></g>
      </svg>
      <div class="count"><b class="num" id="cnt">0</b> de ${n.limit} copas</div>
    </div>
    <div class="cd" id="cdw"><div class="big" id="cd">0:00:00</div><div class="sub" id="cdsub"></div></div>
    <div class="chips" id="chips"></div>
  </section>
  <section><div class="sec-h"><h2>¿Qué has pedido?</h2><span class="small mute">un toque = apuntada</span></div>
    <div class="drinks">${CAT.map(c => `<button class="drink ${c.g ? '' : 'zero'}" data-act="drink" data-id="${c.id}">${svg(c.d)}${c.n}</button>`).join('')}</div></section>
  <section><div class="sec-h"><h2>La noche</h2><span class="small mute" id="tl-n"></span></div><div class="tl" id="tl"></div></section>
  <section class="stack" style="margin-top:22px">
    <button class="btn mint block" data-act="imHome">${I.home} Ya estoy en casa</button>
    <div class="row"><a class="btn grow" href="${mapsUrl()}" target="_blank" rel="noopener">${I.route} Ruta a casa</a>
    ${S.profile.contact.name || S.profile.contact.phone ? `<button class="btn grow" data-act="tell" data-m="go">${I.send} Avisar</button>` : ''}</div>
    <button class="btn ghost block sm" data-act="endAsk">Terminar la noche sin volver a casa</button>
  </section>`;
}
function refreshNight(plop) {
  const n = S.night; if (!n || view !== 'home' || !$('#hero')) return;
  const k = alc(n).length, fill = clamp(k / n.limit, 0, 1), hero = $('#hero');
  $('#liquid').style.transform = `translateY(${196 - fill * 128}px)`;
  const over = k > n.limit; ['w1', 'w2'].forEach(i => $('#' + i).setAttribute('fill', over ? 'url(#lqo)' : 'url(#lq)'));
  hero.classList.toggle('full', k === n.limit); hero.classList.toggle('over', over);
  if (plop) { hero.classList.remove('plop'); void hero.offsetWidth; hero.classList.add('plop'); }
  $('#cnt').textContent = k;
  const list = [...n.drinks].reverse();
  $('#tl-n').textContent = list.length ? `${list.length} apuntadas` : '';
  $('#tl').innerHTML = list.length ? list.map(d => { const c = cat(d.type); return `<div class="tl-i ${d.g ? '' : 'zero'}"><span class="ic">${svg(c.d)}</span><b>${c.n}</b><time>${hhmm(d.t)}</time><button class="x" data-act="rm" data-id="${d.id}" aria-label="Quitar ${c.n}">×</button></div>`; }).join('')
    : `<div class="empty">Aún nada. Cuando pidas la primera, tócala arriba.</div>`;
  refreshLive();
}
function refreshLive() {
  const n = S.night; if (!n) return;
  const now = Date.now(), left = n.curfew - now, p = clamp((now - n.start) / (n.curfew - n.start), 0, 1), d = Geo.dist();
  document.documentElement.style.setProperty('--phase', p.toFixed(3));
  if (view === 'home' && $('#cd')) {
    $('#cd').textContent = fmtCd(left);
    $('#cdw').className = 'cd' + (left <= 0 ? ' late' : left < 30 * MIN ? ' soon' : '');
    $('#ring').style.strokeDashoffset = 886 * p;
    $('#moon').style.transform = `rotate(${-360 * p}deg)`;
    let sub = left > 0 ? `para tu tope de las <b>${hhmm(n.curfew)}</b>` : `pasado tu tope de las <b>${hhmm(n.curfew)}</b>`;
    if (left > 0 && d != null && d > S.profile.radius) sub += `<br>sal antes de las <b>${hhmm(n.curfew - walkMs(d))}</b> si vuelves andando`;
    $('#cdsub').innerHTML = sub;
    const b = bac(n.drinks, now), water = n.drinks.filter(x => x.type === 'agua').length, spent = n.drinks.reduce((s, x) => s + x.p, 0);
    $('#chips').innerHTML = [
      [S.profile.home ? (Geo.err === 'denied' ? 'sin permiso' : fmtDist(d)) : 'sin casa', 'hasta casa'],
      ['≈ ' + nf(b.v, 2) + ' g/L', 'alcohol estimado'],
      [b.v > 0 ? hhmm(b.sober) : '—', 'a cero aprox.'],
      [water, water === 1 ? 'vaso de agua' : 'vasos de agua'],
      [eur(spent), 'gastado'],
    ].map(([v, l]) => `<div class="chip"><b>${v}</b>${l}</div>`).join('');
  }
  if (n.alarm) {
    const al = $('#alarm'), bn = $('#banner');
    al.classList.toggle('ringing', Snd.ringing);
    if (al.hidden === !n.alarm.min || !al.innerHTML) renderAlarm();
    const ad = $('#al-dist'); if (ad) ad.textContent = fmtDist(d);
    const nx = $('#al-next'); if (nx) nx.textContent = Snd.ringing ? 'Sonando ahora' : `Vuelve a sonar en ${fmtCd(n.alarm.nextRing - now).slice(2)}`;
    bn.hidden = !n.alarm.min;
    if (n.alarm.min) bn.innerHTML = `<span>Alarma activa · ${S.profile.home ? fmtDist(d) + ' hasta casa' : 'vuelve a casa'}</span><span>Abrir</span>`;
  }
}

/* ---- alarma ---- */
function renderAlarm() {
  const n = S.night; if (!n?.alarm) return;
  const al = $('#alarm'), late = Date.now() >= n.curfew, over = alc(n).length > n.limit, home = S.profile.home;
  const why = late && over ? `Has rebasado tu límite y tu hora tope de las ${hhmm(n.curfew)}.` : late ? `Ha pasado tu hora tope de las ${hhmm(n.curfew)}.` : `Has rebasado tu límite de ${n.limit} copas.`;
  const noGeo = !home || Geo.err;
  al.hidden = n.alarm.min;
  al.innerHTML = `<div class="rings"><i></i><i></i><i></i></div>
    <p class="eyebrow" style="color:#fff">Lo pactaste tú</p>
    <div class="acasa">A CASA</div>
    <p class="why">${why} Esto no para hasta que estés cerca.</p>
    <div class="dist"><b id="al-dist">${fmtDist(Geo.dist())}</b><span>${!home ? 'no hay casa guardada' : Geo.err === 'denied' ? 'sin permiso de ubicación' : Geo.err ? 'no consigo ubicarte' : 'hasta casa (aprox.)'}</span></div>
    <div class="acts">
      <a class="btn white" href="${mapsUrl()}" target="_blank" rel="noopener">${I.route} Ruta a casa</a>
      <button class="btn" data-act="imHome">${I.pin} Comprobar si ya he llegado</button>
      <div class="row"><button class="btn grow sm" data-act="mute">Callar esta ronda</button><button class="btn grow sm" data-act="alMin">Minimizar</button></div>
      ${noGeo ? `<button class="hold mintf" data-hold="confirmHome" style="--ms:5000ms"><span class="fill"></span><span>Mantén 5 s: confirmo que estoy en casa</span></button>` : ''}
      <button class="hold danger" data-hold="surrender" style="--ms:10000ms"><span class="fill"></span><span>Rendirme (mantén 10 s · rompe tu racha)</span></button>
    </div>
    <p class="next" id="al-next"></p>`;
}

/* ---- hojas de la noche ---- */
function newNightSheet() {
  openSheet('new', `<h2>El pacto de hoy</h2><p class="lead">Decídelo ahora. Luego solo podrás ponértelo más difícil.</p>
  <div class="stack">
    <label class="field"><span>Hora tope para irte a casa</span><input class="input" type="time" id="nn-curfew" value="${S.prefs.curfew}"></label>
    <p class="small mute" id="nn-in" style="text-align:center;margin-top:6px"></p>
    <div class="field"><span>Límite de copas</span>${stepper('nn-limit', S.prefs.limit, 1, 15, 'copas')}</div>
    <div class="field"><span>Si llevo un rato sin apuntar, pregúntame cada</span>
      <div class="seg" id="nn-check">${[[30, '30 min'], [45, '45 min'], [60, '1 h'], [0, 'Nunca']].map(([v, l]) => `<button type="button" data-act="pickSeg" data-val="${v}" class="${v == S.prefs.checkin ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${S.profile.home ? '' : `<p class="small" style="color:var(--amber)">No has guardado tu casa: la alarma no podrá apagarse sola al llegar.</p>`}
    <button class="hold" data-hold="seal" style="--ms:1200ms"><span class="fill"></span><span>Mantén pulsado para sellar el pacto</span></button>
  </div>`);
  nnPreview();
}
function nnPreview() { const i = $('#nn-curfew'), o = $('#nn-in'); if (i && o && i.value) o.textContent = `Dentro de ${fmtDur(curfewTs(i.value) - Date.now())}`; }
function checkinSheet() {
  const n = S.night;
  openSheet('checkin', `<h2>¿Cuántas llevas?</h2><p class="lead">Hace ${fmtDur(Date.now() - n.lastReport)} que no apuntas nada. Tengo ${alc(n).length} de ${n.limit}.</p>
  <div class="stack"><button class="btn primary block" data-act="same">Sigo igual</button><button class="btn block" data-act="later">He pedido algo: lo apunto</button></div>`, { modal: true });
}
function tightenSheet() {
  const n = S.night, d = new Date(n.curfew), v = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  openSheet('tight', `<h2>Pacto sellado</h2><p class="lead">Tope a las ${hhmm(n.curfew)} y ${n.limit} copas. Solo puedes endurecerlo: irte antes o beber menos.</p>
  <div class="stack"><label class="field"><span>Nueva hora tope (más temprano)</span><input class="input" type="time" id="tg-curfew" value="${v}"></label>
  <div class="field"><span>Nuevo límite</span>${stepper('tg-limit', n.limit, Math.max(1, alc(n).length), n.limit, 'copas')}</div>
  <button class="btn primary block" data-act="tightenOk">Endurecer</button></div>`);
}
function summary(r, fresh) {
  const ok = isOk(r), c = S.profile.contact;
  const title = r.outcome === 'surrender' ? 'Te rendiste' : !ok ? (r.alarm === 'limit' ? 'En casa, pero te pasaste' : 'Llegaste, pero tarde') : r.outcome === 'manual' ? 'Noche cerrada' : 'En casa y a tiempo';
  const sub = r.outcome === 'surrender' ? 'La racha vuelve a cero. Mañana, otra oportunidad.' : !ok ? (r.alarm === 'limit' ? `Rebasaste tu límite de ${r.limit}.` : `Pasaste tu tope ${r.late} min.`) + ' Lo importante: ya estás.' : `Racha: ${streak()} ${streak() === 1 ? 'noche' : 'noches'}. Así se hace.`;
  openSheet('sum', `<div class="sum-hd ${ok ? 'ok' : 'bad'}"><div class="em">${ok ? I.check : I.alert}</div><h2>${title}</h2><p class="mute">${sub}</p></div>
  <div class="grid2">
    <div class="card tile ${r.count > r.limit ? 'warn' : ''}"><b>${r.count} / ${r.limit}</b><span>copas · ${nf(r.grams / 10, 1)} UBE</span></div>
    <div class="card tile"><b>${hhmm(r.end)}</b><span>fin · tope ${hhmm(r.curfew)}</span></div>
    <div class="card tile"><b>${eur(r.spent)}</b><span>gastado</span></div>
    <div class="card tile"><b>${r.sober && r.sober > r.end ? hhmm(r.sober) : '—'}</b><span>alcohol a cero aprox.</span></div>
  </div>
  ${fresh.length ? `<div class="card notice" style="margin-top:12px">${I.star}<span class="small"><b>Insignia nueva: ${fresh.map(b => b.n).join(', ')}</b></span></div>` : ''}
  <p class="small mute" style="margin:14px 0">${r.water < r.count / 2 ? 'Bebe un vaso grande de agua antes de dormir. ' : ''}La estimación de alcohol es orientativa: no la uses para decidir si conduces.</p>
  <div class="stack">${(c.name || c.phone) && r.outcome !== 'manual' && r.outcome !== 'surrender' ? `<button class="btn block" data-act="tell" data-m="home">${I.send} Avisar a ${esc(c.name || 'mi contacto')} de que he llegado</button>` : ''}
  <button class="btn primary block" data-act="closeSheet">Hecho</button></div>`);
}

/* ---- historial ---- */
function badges() {
  const H = S.history, ok = H.filter(isOk); let best = 0, run = 0;
  [...H].reverse().forEach(h => { run = isOk(h) ? run + 1 : 0; best = Math.max(best, run); });
  return [
    { id: 'first', n: 'Primera noche', t: 'cerrar una noche', i: I.moon, got: H.length > 0 },
    { id: 's3', n: 'Racha de 3', t: 'tres seguidas cumplidas', i: I.flame, got: best >= 3 },
    { id: 's7', n: 'Racha de 7', t: 'siete seguidas', i: I.star, got: best >= 7 },
    { id: 'cind', n: 'Cenicienta', t: 'en casa 30 min antes', i: I.clock, got: ok.some(h => h.outcome === 'home' && h.curfew - h.end >= 30 * MIN) },
    { id: 'camel', n: 'Camello', t: 'tanta agua como copas', i: I.drop, got: H.some(h => h.count > 0 && h.water >= h.count) },
    { id: 'five', n: 'De fiar', t: 'cinco noches cumplidas', i: I.check, got: ok.length >= 5 },
  ];
}
function vHistory() {
  const H = S.history, ok = H.filter(isOk).length;
  const avg = H.length ? H.reduce((s, h) => s + h.count, 0) / H.length : 0, spent = H.reduce((s, h) => s + h.spent, 0);
  return `${topBar()}<h1 style="font-size:38px;margin-bottom:16px">Tus noches</h1>
  <div class="grid2">
    <div class="card tile ${streak() ? 'ok' : ''}"><b>${streak()}</b><span>racha actual</span></div>
    <div class="card tile"><b>${H.length ? Math.round(ok / H.length * 100) + ' %' : '—'}</b><span>noches cumplidas (${ok} de ${H.length})</span></div>
    <div class="card tile"><b>${H.length ? nf(avg, 1) : '—'}</b><span>copas de media</span></div>
    <div class="card tile"><b>${eur(spent)}</b><span>gastado en total</span></div>
  </div>
  <section><div class="sec-h"><h2>Insignias</h2><span class="small mute">${badges().filter(b => b.got).length} de 6</span></div>
    <div class="badges">${badges().map(b => `<div class="badge ${b.got ? 'got' : ''}"><div class="med">${b.i}</div><b>${b.n}</b>${b.t}</div>`).join('')}</div></section>
  <section><div class="sec-h"><h2>Historial</h2></div>
  ${H.length ? H.map(h => {
    const o = isOk(h), pill = h.outcome === 'surrender' ? ['bad', 'Rendición'] : !o ? ['bad', h.alarm === 'limit' ? 'Límite rebasado' : `${h.late} min tarde`] : h.outcome === 'manual' ? ['mid', 'Cerrada a mano'] : ['ok', 'Cumplida'];
    const pips = Array.from({ length: Math.max(h.limit, h.count) }, (_, i) => `<i class="${i < h.count ? (i < h.limit ? 'f' : 'o') : ''}"></i>`).join('');
    return `<div class="card night-c"><div class="hd"><b>${new Date(h.start).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</b><span class="pill ${pill[0]}">${pill[1]}</span></div>
      <div class="pips" role="img" aria-label="${h.count} copas de un límite de ${h.limit}">${pips}</div>
      <div class="meta"><span>Salida <b>${hhmm(h.start)}</b></span><span>Fin <b>${hhmm(h.end)}</b></span><span>Tope <b>${hhmm(h.curfew)}</b></span><span><b>${eur(h.spent)}</b></span>${h.outcome === 'home' ? `<span>${h.verified ? 'Llegada verificada' : 'Llegada sin verificar'}</span>` : ''}</div></div>`;
  }).join('<div style="height:10px"></div>') : `<div class="empty">Aquí aparecerán tus noches cuando cierres la primera.</div>`}</section>`;
}

/* ---- ajustes ---- */
function vSettings() {
  const p = S.profile, f = S.prefs, lk = !!S.night, lock = lk ? `<span class="lock">Bloqueado esta noche</span>` : '';
  return `${topBar()}<h1 style="font-size:38px;margin-bottom:16px">Ajustes</h1>
  <section class="card set"><h2>Tú</h2><div class="stack">
    <label class="field"><span>Nombre</span><input class="input" data-bind="profile.name" value="${esc(p.name)}"></label>
    <div class="row"><label class="field grow"><span>Peso (kg)</span><input class="input" type="number" inputmode="numeric" min="35" max="200" data-bind="profile.weight" value="${p.weight}"></label></div>
    <div class="field"><span>Para estimar el alcohol en sangre</span>${seg('profile.sex', [['f', 'Mujer'], ['m', 'Hombre'], ['x', 'Prefiero no decir']], p.sex)}</div>
  </div></section>
  <section class="card set ${lk ? 'locked' : ''}"><h2>Casa ${lock}</h2><div class="stack lockable">
    ${p.home ? `<div class="homeok">${I.home}<span class="grow">${esc(p.home.label)}</span></div>` : `<p class="small mute">Aún no has guardado tu casa.</p>`}
    <button class="btn block" data-act="pickHome">${p.home ? 'Cambiar casa' : 'Guardar mi casa'}</button>
    <label class="field"><span>Cuenta como "cerca de casa" a menos de <b id="rad-v">${p.radius} m</b></span><input type="range" min="150" max="600" step="50" data-bind="profile.radius" data-out="rad-v" data-suf=" m" value="${p.radius}"></label>
  </div></section>
  <section class="card set ${lk ? 'locked' : ''}"><h2>Alarma ${lock}</h2><div class="stack lockable">
    <div class="field"><span>Sonido</span>${seg('prefs.sound', [['sirena', 'Sirena'], ['pitidos', 'Pitidos'], ['campana', 'Campana']], f.sound)}</div>
    <div class="field"><span>Vuelve a sonar cada</span>${seg('prefs.alarmEvery', [[1, '1 min'], [2, '2 min'], [5, '5 min'], [10, '10 min']], f.alarmEvery)}</div>
    <div class="field"><span>Vibración</span>${seg('prefs.vibrate', [[true, 'Sí'], [false, 'No']], f.vibrate)}</div>
    <button class="btn block" data-act="testAlarm">${I.bell} Probar 4 segundos</button>
  </div></section>
  <section class="card set"><h2>Contacto de confianza</h2><div class="stack">
    <p class="small mute">Un toque para decirle "voy para casa" o "ya he llegado" por WhatsApp.</p>
    <label class="field"><span>Nombre</span><input class="input" data-bind="profile.contact.name" value="${esc(p.contact.name)}"></label>
    <label class="field"><span>Teléfono con prefijo (p. ej. 34600111222)</span><input class="input" type="tel" inputmode="tel" data-bind="profile.contact.phone" value="${esc(p.contact.phone)}"></label>
  </div></section>
  <section class="card set"><h2>Lo que sueles pagar</h2><div class="prices">${CAT.map(c => `<label>${c.n}<input type="number" inputmode="decimal" min="0" step="0.5" data-bind="prefs.prices.${c.id}" value="${price(c.id)}"> €</label>`).join('')}</div></section>
  <section class="card set"><h2>Tus datos</h2><div class="stack">
    <p class="small mute">Todo se guarda solo en este dispositivo. No hay cuentas ni servidores.</p>
    <div class="row"><button class="btn grow" data-act="export">Exportar</button><button class="btn grow" data-act="wipeAsk">Borrar todo</button></div>
  </div></section>
  <p class="legal">Última no es un producto sanitario. Las cifras de alcohol son estimaciones y nunca indican si puedes conducir: si bebes, no conduzcas. Si necesitas ayuda urgente, llama al 112.</p>`;
}

/* ================= acciones ================= */
const setPath = (path, v) => { const ks = path.split('.'), last = ks.pop(); let o = S; ks.forEach(k => o = o[k] = o[k] ?? {}); o[last] = v; save(); };
function setHome(h) { if (homeCb) homeCb(h); }
const A = {
  tab: el => go(el.dataset.v),
  closeSheet,
  step(el) { const o = $('#' + el.dataset.t), v = clamp(parseInt(o.textContent, 10) + +el.dataset.d, +o.dataset.min, +o.dataset.max); o.innerHTML = `${v}<small>${o.dataset.unit}</small>`; buzz(8); },
  pickSeg(el) { el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); },
  set(el) { let v = el.dataset.val; v = v === 'true' ? true : v === 'false' ? false : isNaN(v) ? v : +v; setPath(el.dataset.path, v); A.pickSeg(el); },
  obNext() { if (ob.step === 0) ob.name = $('#ob-name').value.trim(); ob.step++; homeCb = h => { ob.home = h; go('home'); }; go('home'); },
  obDone() { Object.assign(S.profile, { name: ob.name, home: ob.home, onboarded: true }); S.prefs.curfew = $('#ob-curfew').value || '02:00'; S.prefs.limit = stepVal('ob-limit'); save(); go('home'); },
  async homeHere(el) {
    el.disabled = true; toast('Buscando tu ubicación…');
    const p = await Geo.get(); el.disabled = false;
    if (!p) return toast(Geo.err === 'denied' ? 'Sin permiso de ubicación. Actívalo o busca tu dirección.' : 'No consigo ubicarte. Prueba a buscar tu dirección.');
    setHome({ lat: p.lat, lon: p.lon, label: 'Mi casa (ubicación guardada)' }); toast('Casa guardada');
  },
  homePick(el) { const r = geoResults[+el.dataset.i]; setHome({ lat: r3(+r.lat), lon: r3(+r.lon), label: r.display_name.split(',').slice(0, 3).join(',') }); toast('Casa guardada'); },
  pickHome() {
    if (S.night) return toast('No se puede cambiar la casa durante la noche');
    homeCb = h => { S.profile.home = h; save(); closeSheet(); go(view); };
    openSheet('home', `<h2>¿Dónde está casa?</h2><p class="lead">La alarma se apaga cuando el móvil te detecta cerca de este punto.</p><div class="stack">${homePicker(S.profile.home)}</div>`);
  },
  newNight: newNightSheet,
  drink: el => addDrink(el.dataset.id),
  forceDrink(el) { closeSheet(); addDrink(el.dataset.id, true); },
  rm: el => removeDrink(el.dataset.id),
  same() { S.night.lastReport = Date.now(); save(); closeSheet(); toast('Apuntado: sigues igual'); },
  later() { const n = S.night; n.lastReport = Date.now() - Math.max(0, n.checkin - 3) * MIN; save(); closeSheet(); },
  tighten: tightenSheet,
  tightenOk() {
    const n = S.night, c = curfewTs($('#tg-curfew').value, n.start), l = stepVal('tg-limit');
    if (c > n.curfew) return toast('Solo puedes adelantar la hora, no retrasarla');
    if (c <= Date.now()) return toast('Esa hora ya ha pasado');
    n.curfew = c; n.limit = l; n.warned = {}; save(); closeSheet(); go('home'); toast('Pacto endurecido');
  },
  async imHome() {
    const n = S.night; if (!n) return;
    if (!S.profile.home) { if (n.alarm) return toast('No hay casa guardada: usa el botón de confirmar'); return endNight('home', false); }
    toast('Comprobando dónde estás…');
    const p = await Geo.get();
    if (!S.night) return;
    if (!p) { if (n.alarm) { renderAlarm(); return toast('No consigo ubicarte: mantén pulsado para confirmar'); } return endNight('home', false); }
    if (Geo.atHome()) return endNight('home', true);
    toast(`Aún estás a ${fmtDist(Geo.dist()).replace('~', 'unos ')} de casa`); refreshLive();
  },
  endAsk() {
    openSheet('end', `<h2>¿Cerrar la noche aquí?</h2><p class="lead">Úsalo si duermes fuera o ya no vas a beber más. Se guardará como cerrada a mano, sin verificar la vuelta.</p>
    <div class="stack"><button class="btn primary block" data-act="endManual">Cerrar la noche</button><button class="btn ghost block" data-act="closeSheet">Seguir</button></div>`);
  },
  endManual() { closeSheet(); endNight('manual', false); },
  mute() { Snd.stop(); buzz(0); refreshLive(); },
  alMin() { S.night.alarm.min = true; save(); $('#alarm').hidden = true; refreshLive(); },
  alOpen() { S.night.alarm.min = false; save(); renderAlarm(); refreshLive(); },
  tell(el) {
    const c = S.profile.contact, n = S.night;
    const msg = el.dataset.m === 'home' ? 'Ya estoy en casa. Buenas noches.' : `Voy para casa${n ? `, mi tope es a las ${hhmm(n.curfew)}` : ''}. Te aviso al llegar.`;
    const ph = c.phone.replace(/\D/g, '');
    if (ph) open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    else if (navigator.share) navigator.share({ text: msg }).catch(() => {});
    else toast('Añade el teléfono de tu contacto en Ajustes');
  },
  testAlarm() { Snd.alarm(4); buzz([300, 100, 300]); },
  export() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = 'ultima-datos.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  wipeAsk() {
    if (S.night) return toast('Termina la noche antes de borrar');
    openSheet('wipe', `<h2>¿Borrar todo?</h2><p class="lead">Se eliminan tu perfil, tu casa y todo el historial de este dispositivo. No se puede deshacer.</p>
    <div class="stack"><button class="hold danger" data-hold="wipe" style="--ms:2500ms"><span class="fill"></span><span>Mantén pulsado para borrar</span></button><button class="btn ghost block" data-act="closeSheet">Cancelar</button></div>`);
  },
};
const HOLD = {
  seal() { const c = $('#nn-curfew').value; if (!c) return toast('Elige una hora tope'); startNight(c, stepVal('nn-limit'), +($('#nn-check .on')?.dataset.val ?? 45)); toast('Pacto sellado. Pásalo bien.'); },
  surrender() { endNight('surrender', false); },
  confirmHome() { endNight('home', false); },
  wipe() { localStorage.removeItem(KEY); S = load(); ob.step = 0; ob.home = null; closeSheet(); go('home'); },
};

/* ================= eventos ================= */
document.addEventListener('click', e => {
  if (e.target.closest('#banner')) return A.alOpen();
  const el = e.target.closest('[data-act]'); if (!el) return;
  Snd.init(); A[el.dataset.act]?.(el, e);
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form="homeSearch"]'); if (!f) return;
  e.preventDefault(); const q = f.q.value.trim(), box = $('#georesults'); if (q.length < 3) return;
  box.innerHTML = `<p class="small mute">Buscando…</p>`;
  try {
    geoResults = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=4&accept-language=es&q=${encodeURIComponent(q)}`)).json();
    box.innerHTML = geoResults.length ? geoResults.map((r, i) => `<button type="button" data-act="homePick" data-i="${i}">${esc(r.display_name)}</button>`).join('') : `<p class="small mute">Sin resultados. Prueba con calle y ciudad.</p>`;
  } catch { box.innerHTML = `<p class="small mute">No hay conexión para buscar. Usa tu ubicación cuando estés en casa.</p>`; }
});
const onBind = e => {
  const el = e.target.closest?.('[data-bind]');
  if (el) {
    const v = el.type === 'number' || el.type === 'range' ? +el.value : el.value.trim();
    if (el.type === 'number' && (el.value === '' || isNaN(v))) return;
    setPath(el.dataset.bind, v);
    if (el.dataset.out) $('#' + el.dataset.out).textContent = v + (el.dataset.suf || '');
  }
  if (e.target.id === 'nn-curfew') nnPreview();
};
document.addEventListener('input', onBind); document.addEventListener('change', onBind);

let holdT = null, holdEl = null;
function holdStart(el) { if (holdEl) return; holdEl = el; el.classList.add('holding'); Snd.init(); holdT = setTimeout(() => { const f = HOLD[el.dataset.hold]; holdEnd(); buzz(60); f?.(); }, parseInt(el.style.getPropertyValue('--ms')) || 1200); }
function holdEnd() { clearTimeout(holdT); holdEl?.classList.remove('holding'); holdEl = null; }
document.addEventListener('pointerdown', e => { const el = e.target.closest('[data-hold]'); if (el) { e.preventDefault(); holdStart(el); } });
['pointerup', 'pointercancel', 'pointerleave'].forEach(t => document.addEventListener(t, holdEnd, true));
document.addEventListener('contextmenu', e => { if (e.target.closest('[data-hold]')) e.preventDefault(); });
document.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && e.target.matches?.('[data-hold]')) { e.preventDefault(); holdStart(e.target); } if (e.key === 'Escape' && sheetOpen && $('.backdrop[data-act]')) closeSheet(); });
document.addEventListener('keyup', e => { if (e.target.matches?.('[data-hold]')) holdEnd(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (S.night?.alarm) wakeOn(); tick(); } });

/* ================= cielo y confeti ================= */
function stars() {
  const c = $('#stars'), x = c.getContext('2d'); let st = [], w, h, f = 0;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = c.width = innerWidth * d; h = c.height = innerHeight * d; st = Array.from({ length: 90 }, () => ({ x: Math.random() * w, y: Math.random() * h * .8, r: (Math.random() * 1.2 + .3) * d, p: Math.random() * 6.28, s: Math.random() * .03 + .008 })); draw(); };
  const draw = () => { x.clearRect(0, 0, w, h); for (const s of st) { x.globalAlpha = .25 + .6 * Math.abs(Math.sin(s.p + f * s.s)) * (1 - s.y / h); x.fillStyle = '#F5EFE0'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill(); } };
  const loop = () => { f++; if (!document.hidden && f % 3 === 0) draw(); requestAnimationFrame(loop); };
  addEventListener('resize', size); size(); if (!reduced) loop();
}
function confetti() {
  if (reduced) return;
  const c = $('#confetti'), x = c.getContext('2d'), w = c.width = innerWidth, h = c.height = innerHeight, cols = ['#FFB43A', '#FF7A3D', '#57E3B0', '#F5EFE0'];
  const ps = Array.from({ length: 120 }, () => ({ x: w / 2, y: h * .45, vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 4, r: Math.random() * 6 + 3, c: cols[Math.random() * 4 | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
  let t = 0; (function step() {
    x.clearRect(0, 0, w, h); t++;
    for (const p of ps) { p.vy += .45; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - t / 150); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); }
    if (t < 150) requestAnimationFrame(step); else x.clearRect(0, 0, w, h);
  })();
}

/* ================= arranque ================= */
homeCb = h => { ob.home = h; go('home'); };
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').then(r => swReg = r).catch(() => {});
stars();
if (S.night?.alarm) { document.body.classList.add('alarming'); S.night.alarm.nextRing = 0; }
go('home');
setInterval(tick, 1000); tick();
window.__ultima = { get S() { return S; }, Geo, tick, save };   // para pruebas
})();
