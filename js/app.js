// Общий код: шапка, меню, лепестки, анимации. Сервер не нужен.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const C = window.SITE;

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') n.className = attrs[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach(c => n.append(c instanceof Node ? c : document.createTextNode(c == null ? '' : c)));
  return n;
}
function toast(text) {
  let t = $('.toast'); if (!t) { t = el('div', { class: 'toast' }); document.body.append(t); }
  t.textContent = text; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400);
}

const FLOWER = '<svg viewBox="0 0 24 24"><g fill="#ffb3d3">' + [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6" rx="4" ry="5" transform="rotate(${a} 12 12)"/>`).join('') + '</g><circle cx="12" cy="12" r="2.5" fill="#ff4f9a"/></svg>';

const PAGES = [
  ['index.html', '🏯 Главная'], ['members.html', '👥 Состав семьи'], ['ranks.html', '📈 Система повышения'],
  ['join.html', '✉️ Подать заявку в семью'], ['rules.html', '📜 Правила семьи']
];

function buildShell() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const top = el('header', { class: 'topbar' });
  top.innerHTML = `
    <div class="tl"><button class="icon-btn" id="menuBtn" aria-label="Меню">☰</button>
      <a class="brand" href="index.html"><span class="logo">${FLOWER}</span><span>SKYBORN</span></a></div>
    <div class="tr"><a class="toplink" href="members.html">Состав</a>
      <button class="icon-btn" id="searchBtn" title="Поиск по странице" aria-label="Поиск">🔎</button>
      <button class="icon-btn" id="themeBtn" title="Тёмная / светлая тема" aria-label="Сменить тему">🌙</button>
      <a class="userpill" href="join.html"><span class="av">✿</span><span><b>Вступить</b><small>подать заявку</small></span></a></div>`;
  const scrim = el('div', { class: 'scrim' });
  const dr = el('aside', { class: 'drawer' });
  dr.innerHTML = `<div class="dh"><a class="brand" href="index.html"><span class="logo">${FLOWER}</span><span>SKYBORN</span></a>
    <button class="icon-btn" id="closeBtn" aria-label="Закрыть">✕</button></div><h6>Главные разделы семьи</h6>`;
  PAGES.forEach(([h, t]) => dr.append(el('a', { class: 'item' + (h === page ? ' active' : ''), href: h }, t)));
  dr.append(el('div', { class: 'foot' }, `Сайт семьи ${C.name} · ${C.server}`));
  document.body.prepend(top, scrim, dr);
  const open = v => { dr.classList.toggle('open', v); scrim.classList.toggle('open', v); };
  $('#menuBtn').onclick = () => open(true); $('#closeBtn').onclick = () => open(false); scrim.onclick = () => open(false);
  document.addEventListener('keydown', e => e.key === 'Escape' && open(false));
  document.body.append(el('footer', {}, `🌸 ${C.name} · ${C.server}`));
}

// падающие лепестки сакуры
function petals() {
  const c = el('canvas', { id: 'petals' }); document.body.append(c);
  const x = c.getContext('2d'); let W, H;
  const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; rs(); addEventListener('resize', rs);
  const N = innerWidth < 700 ? 22 : 46;
  const P = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 5 + Math.random() * 9, v: .5 + Math.random() * 1.1,
    w: Math.random() * 6.28, ws: .01 + Math.random() * .02, r: Math.random() * 6.28, rs: (Math.random() - .5) * .04, a: .4 + Math.random() * .5 }));
  (function tick() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y += p.v; p.w += p.ws; p.x += Math.sin(p.w) * .8 + .3; p.r += p.rs;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; } if (p.x > W + 20) p.x = -20;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = p.a;
      x.fillStyle = '#ff9cc7'; x.beginPath(); x.ellipse(0, 0, p.s * .55, p.s, 0, 0, 6.283); x.fill(); x.restore();
    }
    requestAnimationFrame(tick);
  })();
}

// плавное появление блоков и счётчики
function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).concat(e.target.dataset.count ? [e.target] : []).forEach(n => {
      const to = +n.dataset.count; const t0 = performance.now();
      (function f(t) { const k = Math.min(1, (t - t0) / 1400); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }), { threshold: .15 });
  $$('.rv').forEach((n, i) => { n.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(n); });
}

// состав семьи из config.js
function initMembers() {
  const box = $('#members'); if (!box) return;
  C.members.forEach(m => box.append(el('div', { class: 'card person rv' },
    el('div', { class: 'av' }, m.name[0].toUpperCase()), el('h3', {}, m.name), el('span', { class: 'rk' }, m.rank))));
}

// форма заявки: показывает «отправлено», но данные никуда не уходят и нигде не сохраняются
function initApply() {
  const f = $('#applyForm'); if (!f) return;
  const out = $('#applyOut');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Отправляем…';
    setTimeout(() => {
      const nick = f.elements.nickname.value.trim();
      f.reset(); f.hidden = true; out.innerHTML = '';
      out.append(
        el('div', { class: 'msg ok', style: 'font-size:16px' }, `✅ Заявка отправлена! Спасибо, ${nick}. Мы рассмотрим её в ближайшее время.`),
        el('p', { style: 'margin-top:16px' },
          el('button', { class: 'btn sm ghost', onclick: () => { out.innerHTML = ''; f.hidden = false; btn.disabled = false; btn.textContent = 'Отправить заявку'; } }, 'Подать ещё одну'), ' ',
          el('a', { class: 'btn sm', href: 'index.html' }, 'На главную')));
      toast('Заявка отправлена');
    }, 900);
  });
}

// тёмная / светлая тема (запоминается в браузере)
function initTheme() {
  let t = null;
  try { t = localStorage.getItem('theme'); } catch {}
  if (!t) t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const btn = $('#themeBtn');
  const apply = v => {
    document.documentElement.setAttribute('data-theme', v);
    btn.textContent = v === 'light' ? '☀️' : '🌙';
    try { localStorage.setItem('theme', v); } catch {}
  };
  apply(t);
  btn.onclick = () => apply(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

// поиск по содержимому текущей страницы: скрывает карточки, где нет совпадений
function initSearch() {
  const inp = el('input', { type: 'search', placeholder: 'Поиск по странице…', 'aria-label': 'Поиск' });
  const cnt = el('span', { class: 'cnt' });
  const bar = el('div', { class: 'searchbar' }, inp, cnt);
  $('.topbar').after(bar);
  const run = () => {
    const q = inp.value.trim().toLowerCase(); let n = 0;
    $$('main .card').forEach(c => {
      if (c.querySelector('form')) return;
      const hit = !q || c.textContent.toLowerCase().includes(q);
      c.classList.toggle('hide', !hit); if (hit) n++;
    });
    cnt.textContent = q ? (n ? `Найдено: ${n}` : 'Ничего не найдено') : '';
  };
  const toggle = open => {
    bar.classList.toggle('open', open);
    if (open) inp.focus(); else { inp.value = ''; run(); }
  };
  inp.addEventListener('input', run);
  $('#searchBtn').onclick = () => toggle(!bar.classList.contains('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('open')) toggle(false); });
}

document.addEventListener('DOMContentLoaded', () => { buildShell(); initTheme(); initSearch(); petals(); initMembers(); initApply(); reveal(); });
