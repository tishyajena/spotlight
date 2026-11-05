/* ==========================================================================
   Spotlight · app.js
   Vanilla JS single-page app: hash router, views, search/filter,
   registration with validation, Local Storage, theme and countdowns.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const main = $('#main');
  const TZ = 'Asia/Kolkata';
  const EVENTS = (window.EVENTS || []).slice();
  const CATEGORIES = ['Tech', 'Music', 'Workshop', 'Cultural', 'Sports', 'Business'];
  const CAT_COLORS = {
    Tech: ['#6d5dfc', '#22d3ee'],
    Music: ['#ff4d8d', '#ffb547'],
    Workshop: ['#12a37a', '#a3e635'],
    Cultural: ['#f97316', '#e11d48'],
    Sports: ['#0ea5e9', '#6366f1'],
    Business: ['#334155', '#8b5cf6']
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pad = (n) => String(n).padStart(2, '0');

  const fmt = {
    day: (d) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: TZ }).format(new Date(d)),
    mon: (d) => new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: TZ }).format(new Date(d)),
    date: (d) => new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(d)),
    time: (d) => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ }).format(new Date(d)).toUpperCase(),
    price: (p) => (p === 0 ? 'Free' : '₹' + p.toLocaleString('en-IN')),
    stamp: (d) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(new Date(d))
  };

  /* ------------------------------------------------------------------------
     Storage (Local Storage, failure-safe)
     ------------------------------------------------------------------------ */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }
  };
  const REG_KEY = 'spotlight-registrations';
  const getRegs = () => store.get(REG_KEY, []);
  const saveRegs = (list) => { store.set(REG_KEY, list); updateRegBadge(); };

  /* ------------------------------------------------------------------------
     Event model helpers
     ------------------------------------------------------------------------ */
  const byId = (id) => EVENTS.find((e) => e.id === id);
  const isPast = (ev) => new Date(ev.end || ev.date).getTime() < Date.now();
  const isLive = (ev) => !isPast(ev) && new Date(ev.date).getTime() <= Date.now();
  const myTickets = (ev) => getRegs().filter((r) => r.eventId === ev.id).reduce((s, r) => s + r.tickets, 0);
  const seatsLeft = (ev) => Math.max(0, ev.seats - ev.booked - myTickets(ev));
  const fillPct = (ev) => Math.min(100, Math.round(((ev.seats - seatsLeft(ev)) / ev.seats) * 100));
  const status = (ev) => {
    if (isPast(ev)) return 'past';
    const left = seatsLeft(ev);
    if (left === 0) return 'soldout';
    if (left <= Math.max(10, ev.seats * 0.1)) return 'few';
    return 'open';
  };
  const canRegister = (ev) => !isPast(ev) && seatsLeft(ev) > 0;
  const upcoming = () => EVENTS.filter((e) => !isPast(e)).sort((a, b) => new Date(a.date) - new Date(b.date));

  /* ------------------------------------------------------------------------
     Icons
     ------------------------------------------------------------------------ */
  const ICONS = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
    org: '<path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    empty: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M9 15l6 0"/>',
    Tech: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    Music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    Workshop: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    Cultural: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    Sports: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9.5c5 1 12 1 17 0M3.5 14.5c5-1 12-1 17 0M12 3c-3 5-3 13 0 18M12 3c3 5 3 13 0 18"/>',
    Business: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'
  };
  const icon = (name, size = 18, extra = '') =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[name] || ''}</svg>`;

  /* ------------------------------------------------------------------------
     Generated cover art: every event gets a unique, deterministic SVG
     (no external images, so nothing breaks offline or after deployment).
     ------------------------------------------------------------------------ */
  function cover(ev) {
    const [c1, c2] = CAT_COLORS[ev.category] || CAT_COLORS.Tech;
    const h = hash(ev.id);
    const r = (n, min, max) => min + ((h >>> n) % (max - min));
    const gid = 'g' + h.toString(36);
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      const s = hash(ev.id + i);
      const cx = s % 800, cy = (s >>> 8) % 450, rad = 40 + ((s >>> 16) % 160);
      shapes.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fff" opacity="${(0.05 + (i % 3) * 0.04).toFixed(2)}"/>`);
    }
    const rings = `<circle cx="${r(3, 520, 720)}" cy="${r(5, 80, 200)}" r="120" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>
      <circle cx="${r(3, 520, 720)}" cy="${r(5, 80, 200)}" r="170" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`;
    const lines = Array.from({ length: 6 }, (_, i) => `<path d="M${-50 + i * 60} 470 L ${250 + i * 90} ${r(i, 120, 300)}" stroke="#fff" stroke-opacity=".08" stroke-width="22" stroke-linecap="round"/>`).join('');
    return `<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(ev.title)} cover art">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="800" height="450" fill="url(#${gid})"/>
      ${lines}${shapes.join('')}${rings}
      <g transform="translate(${r(7, 560, 640)} ${r(9, 220, 280)}) scale(5.2)" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[ev.category] || ''}</g>
    </svg>`;
  }

  /* ------------------------------------------------------------------------
     UI primitives: toast, modal, confetti
     ------------------------------------------------------------------------ */
  function toast(msg, ic = 'check') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(ic, 18) + '<span>' + esc(msg) + '</span>';
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); el.addEventListener('animationend', () => el.remove(), { once: true }); }, 2800);
  }

  const modal = {
    el: $('#modal'),
    lastFocus: null,
    open(html, onOpen) {
      this.lastFocus = document.activeElement;
      $('#modalBody').innerHTML = html;
      this.el.hidden = false;
      this.el.classList.remove('closing');
      document.body.classList.add('modal-open');
      const first = $('input, select, button:not(.modal-close)', this.el) || $('.modal-close', this.el);
      requestAnimationFrame(() => first && first.focus());
      if (onOpen) onOpen($('#modalBody'));
    },
    close() {
      if (this.el.hidden) return;
      this.el.classList.add('closing');
      setTimeout(() => {
        this.el.hidden = true;
        this.el.classList.remove('closing');
        $('#modalBody').innerHTML = '';
        document.body.classList.remove('modal-open');
        if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
      }, 180);
    }
  };
  modal.el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) modal.close(); });
  document.addEventListener('keydown', (e) => {
    if (modal.el.hidden) return;
    if (e.key === 'Escape') modal.close();
    if (e.key === 'Tab') {
      // Simple focus trap inside the dialog
      const f = $$('a[href], button:not([disabled]), input, select, textarea', modal.el).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#6d5dfc', '#ff4d8d', '#ffb547', '#12a37a', '#22d3ee'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * 0.3 + 's';
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(c);
      c.addEventListener('animationend', () => c.remove());
    }
  }

  /* ------------------------------------------------------------------------
     Countdown timers: any element with [data-countdown="<iso>"] ticks
     ------------------------------------------------------------------------ */
  function countdownHTML(iso) {
    return `<div class="countdown" data-countdown="${iso}" aria-label="Time until event starts">
      <div><strong data-u="d">--</strong><span>Days</span></div>
      <div><strong data-u="h">--</strong><span>Hours</span></div>
      <div><strong data-u="m">--</strong><span>Mins</span></div>
      <div><strong data-u="s">--</strong><span>Secs</span></div>
    </div>`;
  }
  function tickCountdowns() {
    $$('[data-countdown]').forEach((el) => {
      const diff = new Date(el.dataset.countdown).getTime() - Date.now();
      if (diff <= 0) {
        el.outerHTML = '<div class="countdown-live">Happening now</div>';
        return;
      }
      const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
      const set = (u, v) => { const n = $(`[data-u="${u}"]`, el); if (n && n.textContent !== v) n.textContent = v; };
      set('d', String(d)); set('h', pad(h)); set('m', pad(m)); set('s', pad(s));
    });
  }
  setInterval(tickCountdowns, 1000);

  /* ------------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------------ */
  const revealer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealer.unobserve(en.target); } }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    : null;
  function observeReveals(root = main) {
    $$('.reveal', root).forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
      revealer ? revealer.observe(el) : el.classList.add('in');
    });
  }

  /* ------------------------------------------------------------------------
     Components
     ------------------------------------------------------------------------ */
  function statusChip(ev) {
    const st = status(ev);
    if (isLive(ev)) return '<span class="chip chip-warn">Live now</span>';
    if (st === 'past') return '<span class="chip chip-done">Ended</span>';
    if (st === 'soldout') return '<span class="chip chip-sold">Sold out</span>';
    if (st === 'few') return `<span class="chip chip-warn">${seatsLeft(ev)} seats left</span>`;
    return ev.featured ? '<span class="chip">Featured</span>' : '';
  }

  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  }

  function eventCard(ev, q = '') {
    const registered = getRegs().some((r) => r.eventId === ev.id);
    return `<article class="event-card reveal ${isPast(ev) ? 'is-past' : ''}">
      <a href="#/event/${ev.id}" class="cover" tabindex="-1" aria-hidden="true">
        ${cover(ev)}
        <div class="cover-badges"><span class="chip chip-dark">${esc(ev.category)}</span>${statusChip(ev)}</div>
        <div class="date-pill"><b>${fmt.day(ev.date)}</b><small>${fmt.mon(ev.date)}</small></div>
      </a>
      <div class="event-body">
        <h3><a href="#/event/${ev.id}">${highlight(ev.title, q)}</a></h3>
        <p class="event-desc">${esc(ev.short)}</p>
        <div class="meta">
          <span>${icon('calendar', 16)} ${fmt.date(ev.date)} · ${fmt.time(ev.date)}</span>
          <span>${icon('pin', 16)} ${highlight(ev.venue + ', ' + ev.city, q)}</span>
        </div>
        <div class="event-foot">
          <span class="price ${ev.price === 0 ? 'free' : ''}">${fmt.price(ev.price)}</span>
          ${registered
            ? `<a href="#/event/${ev.id}" class="btn btn-ghost btn-sm">${icon('check', 16)} Registered</a>`
            : canRegister(ev)
              ? `<button class="btn btn-primary btn-sm" data-register="${ev.id}">Register</button>`
              : `<a href="#/event/${ev.id}" class="btn btn-ghost btn-sm">Details</a>`}
        </div>
      </div>
    </article>`;
  }

  function emptyState(title, text, action = '') {
    return `<div class="empty">${icon('empty', 56)}<h3>${title}</h3><p class="muted">${text}</p>${action}</div>`;
  }

  /* ------------------------------------------------------------------------
     View: Home
     ------------------------------------------------------------------------ */
  function renderHome() {
    const up = upcoming();
    const next = up.find((e) => e.featured && canRegister(e)) || up[0];
    const featured = up.filter((e) => e.featured).slice(0, 3);
    const soon = up.filter((e) => !featured.includes(e)).slice(0, 6);
    const cities = new Set(EVENTS.map((e) => e.city)).size;
    const attendees = EVENTS.reduce((s, e) => s + e.booked, 0);

    main.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="eyebrow"><span class="dot"></span>${up.length} events open for registration</span>
            <h1>Find events worth <span class="gradient-text">showing up</span> for.</h1>
            <p class="hero-lead">Hackathons, concerts, workshops and festivals across India. Browse what is coming up, read the details, and grab your seat in under a minute.</p>
            <form class="hero-search" id="heroSearch" role="search">
              <label for="heroQ" class="visually-hidden">Search events</label>
              <input id="heroQ" type="search" placeholder="Search by event, city or topic" autocomplete="off">
              <button class="btn btn-primary" type="submit">${icon('search', 18)} Search</button>
            </form>
            <div class="hero-stats">
              <div><strong data-count="${EVENTS.length}">0</strong><span>Curated events</span></div>
              <div><strong data-count="${cities}">0</strong><span>Cities</span></div>
              <div><strong data-count="${attendees}" data-suffix="+">0</strong><span>Seats booked</span></div>
            </div>
          </div>
          ${next ? `
          <a class="hero-card" href="#/event/${next.id}" aria-label="Next up: ${esc(next.title)}">
            <div class="cover">${cover(next)}<div class="cover-badges"><span class="chip chip-dark">Next up</span>${statusChip(next)}</div></div>
            <div class="hero-card-body">
              <h3>${esc(next.title)}</h3>
              <div class="meta" style="margin:0">
                <span>${icon('calendar', 16)} ${fmt.date(next.date)} · ${fmt.time(next.date)}</span>
                <span>${icon('pin', 16)} ${esc(next.venue)}, ${esc(next.city)}</span>
              </div>
              ${countdownHTML(next.date)}
            </div>
          </a>` : ''}
        </div>
      </section>

      ${featured.length ? `
      <section class="section" id="featured">
        <div class="container">
          <div class="section-head reveal">
            <div><h2>Featured events</h2><p class="muted">Handpicked by the Spotlight team this season.</p></div>
            <a href="#/events" class="btn btn-ghost">View all ${icon('arrowRight', 16)}</a>
          </div>
          <div class="event-grid">${featured.map((e) => eventCard(e)).join('')}</div>
        </div>
      </section>` : ''}

      <section class="section section-alt">
        <div class="container">
          <div class="section-head reveal"><div><h2>Browse by category</h2><p class="muted">Jump straight to what you are into.</p></div></div>
          <div class="category-grid">
            ${CATEGORIES.map((c) => {
              const n = up.filter((e) => e.category === c).length;
              return `<a class="category-tile reveal" href="#/events?cat=${c}">
                <span class="cat-icon" style="background:linear-gradient(135deg,${CAT_COLORS[c][0]},${CAT_COLORS[c][1]})">${icon(c, 22)}</span>
                <strong>${c}</strong><span>${n} upcoming</span></a>`;
            }).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head reveal">
            <div><h2>Coming up soon</h2><p class="muted">Sorted by date, nearest first.</p></div>
            <a href="#/events" class="btn btn-ghost">Browse all ${icon('arrowRight', 16)}</a>
          </div>
          <div class="event-grid">${soon.map((e) => eventCard(e)).join('')}</div>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container">
          <div class="section-head reveal"><div><h2>How it works</h2><p class="muted">Three steps, no account needed.</p></div></div>
          <div class="steps">
            <div class="step reveal"><h3>Discover</h3><p>Search by name, city or topic, or filter by category to find something you will love.</p></div>
            <div class="step reveal"><h3>Register</h3><p>Fill a short form with your name, email and phone. We validate it instantly so nothing goes wrong.</p></div>
            <div class="step reveal"><h3>Show up</h3><p>Your ticket is saved on this device under My Registrations, with a live countdown to the day.</p></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-band reveal">
            <h2>Your next favourite memory is one click away.</h2>
            <p>New events are added every week. Explore the full calendar and lock in your seat before it sells out.</p>
            <a href="#/events" class="btn">Explore all events ${icon('arrowRight', 16)}</a>
          </div>
        </div>
      </section>`;

    $('#heroSearch').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('#heroQ').value.trim();
      location.hash = '#/events' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
    animateCounters();
  }

  function animateCounters() {
    $$('[data-count]').forEach((el) => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { el.textContent = target.toLocaleString('en-IN') + suffix; return; }
      const start = performance.now(), dur = 1200;
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-IN') + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ------------------------------------------------------------------------
     View: Events listing with search, category filter, sort
     ------------------------------------------------------------------------ */
  const filters = { q: '', cat: 'All', sort: 'date', past: false };

  function filterEvents() {
    const q = filters.q.trim().toLowerCase();
    let list = EVENTS.filter((e) => {
      if (!filters.past && isPast(e)) return false;
      if (filters.cat !== 'All' && e.category !== filters.cat) return false;
      if (!q) return true;
      const hay = [e.title, e.venue, e.city, e.category, e.organizer, e.short, ...(e.tags || [])].join(' ').toLowerCase();
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
    const sorters = {
      date: (a, b) => new Date(a.date) - new Date(b.date),
      priceAsc: (a, b) => a.price - b.price || new Date(a.date) - new Date(b.date),
      priceDesc: (a, b) => b.price - a.price || new Date(a.date) - new Date(b.date),
      popular: (a, b) => fillPct(b) - fillPct(a)
    };
    list.sort(sorters[filters.sort] || sorters.date);
    // Past events always sink to the bottom when shown.
    if (filters.past) list.sort((a, b) => isPast(a) - isPast(b));
    return list;
  }

  function renderEvents(params) {
    filters.q = params.get('q') || '';
    filters.cat = CATEGORIES.includes(params.get('cat')) ? params.get('cat') : 'All';
    filters.sort = params.get('sort') || 'date';
    filters.past = params.get('past') === '1';

    main.innerHTML = `
      <section class="container page-head">
        <h1>All events</h1>
        <p class="muted">Search, filter and sort everything happening on Spotlight.</p>
      </section>
      <div class="toolbar">
        <div class="container">
          <div class="toolbar-row">
            <div class="search-box">
              ${icon('search', 18)}
              <label for="q" class="visually-hidden">Search events</label>
              <input id="q" class="input" type="search" placeholder="Search events, venues, cities, tags..." value="${esc(filters.q)}" autocomplete="off">
              <button class="search-clear" id="qClear" type="button" aria-label="Clear search" ${filters.q ? '' : 'hidden'}>${icon('x', 14)}</button>
            </div>
            <label for="sort" class="visually-hidden">Sort events</label>
            <select id="sort" class="select">
              <option value="date">Date: soonest</option>
              <option value="popular">Most popular</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
            </select>
            <label class="toggle"><input type="checkbox" id="past" ${filters.past ? 'checked' : ''}> Show past</label>
          </div>
          <div class="chips" role="group" aria-label="Filter by category" id="chips"></div>
        </div>
      </div>
      <section class="container" style="padding-bottom:64px">
        <p class="result-count" id="resultCount" aria-live="polite"></p>
        <div class="event-grid" id="grid"></div>
      </section>`;

    $('#sort').value = filters.sort;
    const q = $('#q');
    q.addEventListener('input', debounce(() => { filters.q = q.value; $('#qClear').hidden = !q.value; updateList(); }, 160));
    $('#qClear').addEventListener('click', () => { q.value = ''; filters.q = ''; $('#qClear').hidden = true; q.focus(); updateList(); });
    $('#sort').addEventListener('change', (e) => { filters.sort = e.target.value; updateList(); });
    $('#past').addEventListener('change', (e) => { filters.past = e.target.checked; updateList(); });
    $('#chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      filters.cat = b.dataset.cat;
      updateList();
    });
    updateList();
  }

  function updateList() {
    // Chips with live counts (respect search + past toggle, ignore category)
    const base = EVENTS.filter((e) => filters.past || !isPast(e));
    const q = filters.q.trim().toLowerCase();
    const matchQ = (e) => !q || q.split(/\s+/).every((w) => [e.title, e.venue, e.city, e.category, e.organizer, e.short, ...(e.tags || [])].join(' ').toLowerCase().includes(w));
    $('#chips').innerHTML = ['All', ...CATEGORIES].map((c) => {
      const n = base.filter((e) => matchQ(e) && (c === 'All' || e.category === c)).length;
      return `<button type="button" class="filter-chip" data-cat="${c}" aria-pressed="${filters.cat === c}">${c}<span class="n">${n}</span></button>`;
    }).join('');

    const list = filterEvents();
    const grid = $('#grid');
    $('#resultCount').textContent = list.length
      ? `Showing ${list.length} event${list.length > 1 ? 's' : ''}${filters.cat !== 'All' ? ' in ' + filters.cat : ''}${filters.q ? ' matching "' + filters.q.trim() + '"' : ''}`
      : '';
    grid.innerHTML = list.length
      ? list.map((e) => eventCard(e, filters.q.trim())).join('')
      : emptyState('No events found', 'Try a different keyword or clear the filters.', '<button class="btn btn-ghost" id="resetFilters" type="button">Reset filters</button>');
    const reset = $('#resetFilters');
    if (reset) reset.addEventListener('click', () => { filters.q = ''; filters.cat = 'All'; $('#q').value = ''; $('#qClear').hidden = true; updateList(); });
    observeReveals(grid);
    syncQuery();
  }

  // Keep filter state shareable in the URL without re-triggering the router.
  function syncQuery() {
    const p = new URLSearchParams();
    if (filters.q.trim()) p.set('q', filters.q.trim());
    if (filters.cat !== 'All') p.set('cat', filters.cat);
    if (filters.sort !== 'date') p.set('sort', filters.sort);
    if (filters.past) p.set('past', '1');
    const s = p.toString();
    const url = '#/events' + (s ? '?' + s : '');
    if (location.hash !== url) history.replaceState(null, '', url);
  }

  /* ------------------------------------------------------------------------
     View: Event detail
     ------------------------------------------------------------------------ */
  function renderDetail(id) {
    const ev = byId(id);
    if (!ev) return renderNotFound();
    document.title = ev.title + ' · Spotlight';
    const left = seatsLeft(ev);
    const regs = getRegs().filter((r) => r.eventId === ev.id);
    const related = upcoming().filter((e) => e.category === ev.category && e.id !== ev.id).slice(0, 3);

    let action;
    if (isPast(ev)) action = `<div class="notice notice-muted">${icon('clock', 18)} This event has ended.</div>`;
    else if (left === 0) action = `<div class="notice notice-danger">${icon('alert', 18)} Sold out. Check back in case seats free up.</div>`;
    else action = `<button class="btn btn-primary btn-block" data-register="${ev.id}">${icon('ticket', 18)} ${regs.length ? 'Register another person' : 'Register now'}</button>`;

    main.innerHTML = `
      <div class="container">
        <a href="#/events" class="back-link">${icon('arrowLeft', 16)} All events</a>
        <div class="detail-hero">
          <div class="cover">${cover(ev)}</div>
          <div class="detail-hero-overlay">
            <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-dark">${esc(ev.category)}</span>${statusChip(ev)}</div>
            <h1>${esc(ev.title)}</h1>
            <p style="margin:0;opacity:.9">${esc(ev.short)}</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-main">
            <div class="info-row">
              <div class="info-item"><span class="ic">${icon('calendar')}</span><div><small>Date</small><b>${fmt.date(ev.date)}</b></div></div>
              <div class="info-item"><span class="ic">${icon('clock')}</span><div><small>Time</small><b>${fmt.time(ev.date)} to ${fmt.time(ev.end)}</b></div></div>
              <div class="info-item"><span class="ic">${icon('pin')}</span><div><small>Venue</small><b>${esc(ev.venue)}, ${esc(ev.city)}</b></div></div>
              <div class="info-item"><span class="ic">${icon('org')}</span><div><small>Organiser</small><b>${esc(ev.organizer)}</b></div></div>
            </div>

            <h2>About this event</h2>
            ${ev.description.map((p) => `<p>${esc(p)}</p>`).join('')}

            <h2>Schedule</h2>
            <ol class="agenda">${ev.agenda.map((a) => `<li><time>${esc(a.time)}</time>${esc(a.item)}</li>`).join('')}</ol>

            <h2>Tags</h2>
            <div class="tags">${ev.tags.map((t) => `<a class="tag" href="#/events?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}</div>
          </div>

          <aside class="side-card" aria-label="Registration">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span class="price ${ev.price === 0 ? 'free' : ''}">${fmt.price(ev.price)}</span>
              <span class="muted small">per person</span>
            </div>
            ${!isPast(ev) && !isLive(ev) ? `<p class="small muted" style="margin:16px 0 0">Starts in</p>${countdownHTML(ev.date)}` : isLive(ev) ? '<div class="countdown-live" style="margin:16px 0">Happening now</div>' : '<hr>'}
            <div class="small" style="display:flex;justify-content:space-between"><span class="muted">${icon('users', 14, 'style="display:inline;vertical-align:-2px"')} Seats filled</span><b>${left} of ${ev.seats.toLocaleString('en-IN')} left</b></div>
            <div class="seat-bar"><i style="width:${fillPct(ev)}%"></i></div>
            <hr>
            ${regs.length ? `<div class="notice notice-success" style="margin-bottom:12px">${icon('check', 18)} You have ${regs.reduce((s, r) => s + r.tickets, 0)} ticket(s) for this event.</div>` : ''}
            ${action}
            <div class="share-row">
              <button class="btn btn-ghost btn-sm" type="button" data-action="share">${icon('share', 16)} Share</button>
              ${!isPast(ev) ? `<button class="btn btn-ghost btn-sm" type="button" data-action="ics">${icon('calendar', 16)} Add to calendar</button>` : ''}
            </div>
          </aside>
        </div>

        ${related.length ? `
        <section style="padding-bottom:40px">
          <div class="section-head"><div><h2>More ${esc(ev.category.toLowerCase())} events</h2></div></div>
          <div class="event-grid">${related.map((e) => eventCard(e)).join('')}</div>
        </section>` : ''}
      </div>`;

    main.querySelector('[data-action="share"]').addEventListener('click', () => shareEvent(ev));
    const ics = main.querySelector('[data-action="ics"]');
    if (ics) ics.addEventListener('click', () => downloadICS(ev));
  }

  async function shareEvent(ev) {
    const url = location.href.split('#')[0] + '#/event/' + ev.id;
    try {
      if (navigator.share) { await navigator.share({ title: ev.title, text: ev.short, url }); return; }
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard');
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      toast('Could not copy the link', 'alert');
    }
  }

  function downloadICS(ev) {
    const z = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Spotlight//Events//EN', 'BEGIN:VEVENT',
      'UID:' + ev.id + '@spotlight', 'DTSTAMP:' + z(Date.now()), 'DTSTART:' + z(ev.date), 'DTEND:' + z(ev.end),
      'SUMMARY:' + ev.title, 'LOCATION:' + ev.venue + ', ' + ev.city, 'DESCRIPTION:' + ev.short, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = ev.id + '.ics';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Calendar file downloaded', 'download');
  }

  /* ------------------------------------------------------------------------
     Registration form + validation
     ------------------------------------------------------------------------ */
  const validators = {
    name(v) {
      v = v.trim().replace(/\s+/g, ' ');
      if (!v) return 'Please enter your full name.';
      if (v.length < 3) return 'Name must be at least 3 characters.';
      if (v.length > 60) return 'Name must be under 60 characters.';
      if (!/^[\p{L}][\p{L} .'-]*$/u.test(v)) return 'Use letters, spaces, dots, hyphens or apostrophes only.';
      return '';
    },
    email(v) {
      v = v.trim();
      if (!v) return 'Please enter your email address.';
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v) || v.includes('..')) return 'Enter a valid email, like name@example.com.';
      return '';
    },
    phone(v) {
      let d = v.replace(/[\s()-]/g, '');
      if (!d) return 'Please enter your phone number.';
      if (/^\+?91\d{10}$/.test(d)) d = d.slice(-10);
      if (/^0\d{10}$/.test(d)) d = d.slice(1);
      if (!/^\d+$/.test(d)) return 'Phone number can only contain digits.';
      if (d.length !== 10) return 'Enter a 10-digit mobile number.';
      if (!/^[6-9]/.test(d)) return 'Indian mobile numbers start with 6, 7, 8 or 9.';
      return '';
    },
    event(v) {
      if (!v) return 'Please choose an event.';
      const ev = byId(v);
      if (!ev || !canRegister(ev)) return 'Registration for this event is closed.';
      return '';
    },
    tickets(v, form) {
      const n = Number(v);
      const ev = byId(form.event.value);
      const max = ev ? Math.min(5, seatsLeft(ev)) : 5;
      if (!Number.isInteger(n) || n < 1) return 'Choose at least 1 ticket.';
      if (n > max) return `You can book up to ${max} ticket${max > 1 ? 's' : ''} for this event.`;
      return '';
    },
    terms(_, form) { return form.terms.checked ? '' : 'Please accept the event guidelines to continue.'; }
  };
  const normPhone = (v) => v.replace(/\D/g, '').slice(-10);

  function openRegister(eventId) {
    const open = upcoming().filter(canRegister);
    const pre = eventId && byId(eventId) && canRegister(byId(eventId)) ? eventId : '';
    const draft = store.get('spotlight-draft', {});

    modal.open(`
      <h2 class="form-title" id="modalTitle">Register for an event</h2>
      <p class="muted small" style="margin:0">Fields marked <span style="color:var(--danger)">*</span> are required.</p>
      <form id="regForm" class="form-grid" novalidate>
        <div class="field">
          <label for="f-event">Event <span class="req">*</span></label>
          <select id="f-event" name="event" class="select" aria-describedby="e-event">
            <option value="">Select an event</option>
            ${open.map((e) => `<option value="${e.id}" ${e.id === pre ? 'selected' : ''}>${esc(e.title)} · ${fmt.day(e.date)} ${fmt.mon(e.date)}</option>`).join('')}
          </select>
          <div class="error" id="e-event" role="alert"></div>
        </div>
        <div class="field">
          <label for="f-name">Full name <span class="req">*</span></label>
          <input id="f-name" name="name" class="input" type="text" autocomplete="name" placeholder="e.g. Aditi Sharma" value="${esc(draft.name || '')}" aria-describedby="e-name">
          <div class="error" id="e-name" role="alert"></div>
        </div>
        <div class="form-row-2">
          <div class="field">
            <label for="f-email">Email <span class="req">*</span></label>
            <input id="f-email" name="email" class="input" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${esc(draft.email || '')}" aria-describedby="e-email">
            <div class="error" id="e-email" role="alert"></div>
          </div>
          <div class="field">
            <label for="f-phone">Phone <span class="req">*</span></label>
            <div class="phone-wrap"><span class="prefix">+91</span>
              <input id="f-phone" name="phone" class="input" type="tel" autocomplete="tel-national" inputmode="numeric" maxlength="14" placeholder="98765 43210" value="${esc(draft.phone || '')}" aria-describedby="e-phone">
            </div>
            <div class="error" id="e-phone" role="alert"></div>
          </div>
        </div>
        <div class="field">
          <label for="f-tickets">Tickets</label>
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="Fewer tickets">−</button>
            <input id="f-tickets" name="tickets" type="number" min="1" max="5" value="1" inputmode="numeric" aria-describedby="e-tickets">
            <button type="button" data-step="1" aria-label="More tickets">+</button>
          </div>
          <div class="hint" id="seatHint"></div>
          <div class="error" id="e-tickets" role="alert"></div>
        </div>
        <div class="summary-line"><span class="muted">Total</span><b id="total">—</b></div>
        <div class="field">
          <label class="check"><input type="checkbox" name="terms" id="f-terms" aria-describedby="e-terms"> I agree to follow the event guidelines and confirm my details are correct.</label>
          <div class="error" id="e-terms" role="alert"></div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">${icon('ticket', 18)} Confirm registration</button>
      </form>`, wireForm);
  }

  function wireForm(root) {
    const form = $('#regForm', root);
    const touched = new Set();
    const fields = ['event', 'name', 'email', 'phone', 'tickets', 'terms'];

    const check = (name, show = true) => {
      const msg = validators[name](form[name].value, form);
      const field = form[name].closest('.field');
      if (show) {
        $('#e-' + name, root).innerHTML = msg ? icon('alert', 14) + ' ' + esc(msg) : '';
        field.classList.toggle('invalid', !!msg);
        field.classList.toggle('valid', !msg && name !== 'terms');
        form[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) { field.style.animation = 'none'; void field.offsetWidth; field.style.animation = ''; }
      }
      return !msg;
    };

    const refreshSummary = () => {
      const ev = byId(form.event.value);
      const n = Math.max(1, Number(form.tickets.value) || 1);
      if (!ev) { $('#total', root).textContent = '—'; $('#seatHint', root).textContent = 'Up to 5 tickets per registration.'; return; }
      const max = Math.min(5, seatsLeft(ev));
      form.tickets.max = max;
      $('#seatHint', root).textContent = `${seatsLeft(ev)} seats left · max ${max} per registration`;
      $('#total', root).textContent = ev.price === 0 ? 'Free' : fmt.price(ev.price * n);
    };

    // Validate on blur first; after that, live as the user types.
    fields.forEach((name) => {
      const el = form[name];
      el.addEventListener('blur', () => { touched.add(name); check(name); });
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
        if (name === 'event' || name === 'tickets') refreshSummary();
        if (name === 'event' && touched.has('tickets')) check('tickets');
        if (touched.has(name) || el.type === 'checkbox' || el.tagName === 'SELECT') { touched.add(name); check(name); }
        if (['name', 'email', 'phone'].includes(name)) store.set('spotlight-draft', { name: form.name.value, email: form.email.value, phone: form.phone.value });
      });
    });

    // Phone: keep only digits, spaces and a leading +
    form.phone.addEventListener('input', () => {
      const cleaned = form.phone.value.replace(/[^\d+\s-]/g, '');
      if (cleaned !== form.phone.value) form.phone.value = cleaned;
    });

    $$('[data-step]', root).forEach((b) => b.addEventListener('click', () => {
      const max = Number(form.tickets.max) || 5;
      form.tickets.value = Math.min(max, Math.max(1, (Number(form.tickets.value) || 1) + Number(b.dataset.step)));
      refreshSummary(); touched.add('tickets'); check('tickets');
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = fields.map((n) => { touched.add(n); return check(n); }).every(Boolean);
      if (!ok) {
        const firstBad = $('.field.invalid input, .field.invalid select', form);
        if (firstBad) firstBad.focus();
        toast('Please fix the highlighted fields', 'alert');
        return;
      }
      const ev = byId(form.event.value);
      const email = form.email.value.trim().toLowerCase();
      const dup = getRegs().find((r) => r.eventId === ev.id && r.email === email);
      if (dup) {
        const f = form.email.closest('.field');
        $('#e-email', root).innerHTML = icon('alert', 14) + ' This email is already registered for this event (ticket ' + dup.id + ').';
        f.classList.add('invalid'); f.classList.remove('valid');
        form.email.focus();
        return;
      }

      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.innerHTML = 'Confirming…';

      // Simulated network delay so the state change feels real.
      setTimeout(() => {
        const reg = {
          id: 'SPT-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase(),
          eventId: ev.id,
          name: form.name.value.trim().replace(/\s+/g, ' '),
          email,
          phone: normPhone(form.phone.value),
          tickets: Number(form.tickets.value),
          amount: ev.price * Number(form.tickets.value),
          createdAt: new Date().toISOString()
        };
        saveRegs([...getRegs(), reg]);
        try { localStorage.removeItem('spotlight-draft'); } catch (err) {}
        showConfirmation(reg, ev);
        rerender();
      }, 650);
    });

    refreshSummary();
  }

  function showConfirmation(reg, ev) {
    $('#modalBody').innerHTML = `
      <div class="success-view">
        <div class="success-icon"><svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h2 id="modalTitle">You're in, ${esc(reg.name.split(' ')[0])}!</h2>
        <p class="muted">Your registration for <b>${esc(ev.title)}</b> is confirmed. A copy is saved under My Registrations on this device.</p>
        <div class="ticket">
          <div class="ticket-row"><span>Ticket ID</span><b class="ticket-id">${reg.id}</b></div>
          <div class="ticket-row"><span>Event</span><b>${esc(ev.title)}</b></div>
          <div class="ticket-row"><span>When</span><b>${fmt.date(ev.date)}, ${fmt.time(ev.date)}</b></div>
          <div class="ticket-row"><span>Where</span><b>${esc(ev.venue)}, ${esc(ev.city)}</b></div>
          <div class="ticket-row"><span>Attendee</span><b>${esc(reg.name)}</b></div>
          <div class="ticket-row"><span>Tickets</span><b>${reg.tickets} · ${reg.amount === 0 ? 'Free' : fmt.price(reg.amount)}</b></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a href="#/registrations" class="btn btn-primary" style="flex:1" data-close>View my registrations</a>
          <button type="button" class="btn btn-ghost" style="flex:1" data-close>Done</button>
        </div>
      </div>`;
    $('#modalBody a').focus();
    confetti();
    toast('Registration confirmed');
  }

  /* ------------------------------------------------------------------------
     View: My registrations (Local Storage management)
     ------------------------------------------------------------------------ */
  function renderRegistrations() {
    const regs = getRegs().slice().sort((a, b) => {
      const ea = byId(a.eventId), eb = byId(b.eventId);
      return (ea && eb) ? (isPast(ea) - isPast(eb)) || new Date(ea.date) - new Date(eb.date) : 0;
    });

    main.innerHTML = `
      <section class="container page-head">
        <div class="section-head" style="margin-bottom:8px">
          <div><h1 style="margin:0">My registrations</h1><p class="muted">Saved in this browser with Local Storage. ${regs.length} registration${regs.length === 1 ? '' : 's'}.</p></div>
          ${regs.length ? `<div class="reg-tools">
            <button class="btn btn-ghost btn-sm" type="button" id="exportCsv">${icon('download', 16)} Export CSV</button>
            <button class="btn btn-danger btn-sm" type="button" id="clearAll">${icon('trash', 16)} Clear all</button>
          </div>` : ''}
        </div>
      </section>
      <section class="container" style="padding:16px 20px 64px">
        ${regs.length ? `<div class="reg-list">${regs.map(regCard).join('')}</div>`
          : emptyState('No registrations yet', 'Events you register for will show up here with your ticket details.', '<a href="#/events" class="btn btn-primary">Browse events</a>')}
      </section>`;

    main.addEventListener('click', onRegClick);
    const exp = $('#exportCsv');
    if (exp) exp.addEventListener('click', exportCSV);
    const clr = $('#clearAll');
    if (clr) clr.addEventListener('click', () => confirmDialog('Clear all registrations?', 'This removes every registration saved on this device. It cannot be undone.', 'Clear all', () => {
      saveRegs([]); toast('All registrations cleared', 'trash'); router();
    }));
  }

  function regCard(r) {
    const ev = byId(r.eventId);
    if (!ev) return '';
    const past = isPast(ev);
    return `<article class="reg-card" data-reg="${r.id}">
      <a href="#/event/${ev.id}" class="cover" aria-hidden="true" tabindex="-1">${cover(ev)}</a>
      <div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
          <span class="ticket-id">${r.id}</span>
          ${past ? '<span class="chip chip-done" style="background:var(--bg-soft);color:var(--text-muted)">Attended</span>' : `<span class="chip" style="background:var(--success-soft);color:var(--success)">Confirmed</span>`}
        </div>
        <h3><a href="#/event/${ev.id}">${esc(ev.title)}</a></h3>
        <div class="meta">
          <span>${icon('calendar', 15)} ${fmt.date(ev.date)} · ${fmt.time(ev.date)}</span>
          <span>${icon('pin', 15)} ${esc(ev.venue)}, ${esc(ev.city)}</span>
          <span>${icon('users', 15)} ${esc(r.name)} · ${r.tickets} ticket${r.tickets > 1 ? 's' : ''} · ${r.amount === 0 ? 'Free' : fmt.price(r.amount)}</span>
        </div>
      </div>
      <div class="actions">
        <a href="#/event/${ev.id}" class="btn btn-ghost btn-sm">View event</a>
        ${past ? '' : `<button class="btn btn-danger btn-sm" type="button" data-cancel="${r.id}">Cancel</button>`}
      </div>
    </article>`;
  }

  function onRegClick(e) {
    const b = e.target.closest('[data-cancel]');
    if (!b) return;
    const reg = getRegs().find((r) => r.id === b.dataset.cancel);
    const ev = reg && byId(reg.eventId);
    if (!reg) return;
    confirmDialog('Cancel this registration?', `Your ${reg.tickets} ticket(s) for ${ev ? ev.title : 'this event'} will be released.`, 'Yes, cancel', () => {
      const card = main.querySelector(`[data-reg="${reg.id}"]`);
      const done = () => { saveRegs(getRegs().filter((r) => r.id !== reg.id)); toast('Registration cancelled', 'trash'); router(); };
      if (card) { card.classList.add('removing'); setTimeout(done, 280); } else done();
    });
  }

  function confirmDialog(title, text, okLabel, onOk) {
    modal.open(`
      <h2 class="form-title" id="modalTitle">${esc(title)}</h2>
      <p class="muted">${esc(text)}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:20px">
        <button type="button" class="btn btn-ghost" data-close>Keep it</button>
        <button type="button" class="btn btn-danger" id="confirmOk">${esc(okLabel)}</button>
      </div>`, (root) => {
      $('#confirmOk', root).addEventListener('click', () => { modal.close(); onOk(); });
    });
  }

  function exportCSV() {
    const rows = [['Ticket ID', 'Event', 'Date', 'Venue', 'Name', 'Email', 'Phone', 'Tickets', 'Amount (INR)', 'Registered at']];
    getRegs().forEach((r) => {
      const ev = byId(r.eventId) || {};
      rows.push([r.id, ev.title, ev.date && fmt.date(ev.date), ev.venue && ev.venue + ', ' + ev.city, r.name, r.email, '+91 ' + r.phone, r.tickets, r.amount, fmt.stamp(r.createdAt)]);
    });
    const csv = rows.map((row) => row.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'spotlight-registrations.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('CSV exported', 'download');
  }

  /* ------------------------------------------------------------------------
     404
     ------------------------------------------------------------------------ */
  function renderNotFound() {
    document.title = 'Not found · Spotlight';
    main.innerHTML = `<section class="container" style="padding:80px 20px">
      ${emptyState('Page not found', 'The page or event you are looking for does not exist or has moved.', '<a href="#/" class="btn btn-primary">Go home</a>')}
    </section>`;
  }

  /* ------------------------------------------------------------------------
     Router
     ------------------------------------------------------------------------ */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query || '') };
  }

  function router() {
    const { parts, params } = parseHash();
    main.removeEventListener('click', onRegClick);
    document.title = 'Spotlight · Discover and register for events';
    const page = parts[0] || 'home';

    if (page === 'home') renderHome();
    else if (page === 'events') renderEvents(params);
    else if (page === 'event' && parts[1]) renderDetail(decodeURIComponent(parts[1]));
    else if (page === 'registrations') renderRegistrations();
    else renderNotFound();

    $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (page === 'event' ? 'events' : page)));
    $$('[data-nav]').forEach((a) => a.classList.contains('active') ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
    observeReveals();
    tickCountdowns();
  }

  // Re-render the current view in place (keeps listing filters intact).
  function rerender() {
    const { parts } = parseHash();
    if (parts[0] === 'events' && $('#grid')) updateList();
    else router();
  }

  let lastPath = null;
  window.addEventListener('hashchange', () => {
    closeMenu();
    if (!modal.el.hidden) modal.close();
    const path = parseHash().parts.join('/');
    if (path !== lastPath) window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
    lastPath = path;
    router();
  });

  /* ------------------------------------------------------------------------
     Global UI: theme, menu, nav shadow, badge, delegated register buttons
     ------------------------------------------------------------------------ */
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('spotlight-theme', next); } catch (e) {}
    $('#themeToggle').setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#0d0c1a' : '#6d5dfc';
  }
  $('#themeToggle').addEventListener('click', toggleTheme);

  const burger = $('#burger'), navLinks = $('#navLinks');
  function closeMenu() { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
  burger.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#nav')) closeMenu(); });
  window.addEventListener('resize', debounce(() => { if (innerWidth > 760) closeMenu(); }, 100));

  const nav = $('#nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

  function updateRegBadge() {
    const n = getRegs().length;
    const b = $('#regCount');
    b.textContent = n;
    b.hidden = n === 0;
  }

  document.addEventListener('click', (e) => {
    const reg = e.target.closest('[data-register]');
    if (reg) { e.preventDefault(); openRegister(reg.dataset.register); return; }
    if (e.target.closest('[data-action="toggle-theme"]')) toggleTheme();
  });

  // Keep the theme in sync across tabs, and registrations too.
  window.addEventListener('storage', (e) => {
    if (e.key === 'spotlight-theme' && e.newValue) document.documentElement.dataset.theme = e.newValue;
    if (e.key === REG_KEY) { updateRegBadge(); rerender(); }
  });

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  $('#themeToggle').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  updateRegBadge();
  lastPath = parseHash().parts.join('/');
  router();
})();
