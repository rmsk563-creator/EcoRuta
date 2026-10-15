// EcoRuta — interacciones de la landing (v2)
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  const header = $('.header');
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => { setMenu(false); setUserMenu(false); }));

  // Enlace activo según la sección visible
  const links = $$('.nav__list a');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Sesión simulada ----------
     Solo se guardan nombre y correo en este navegador.
     La contraseña nunca se guarda ni se envía. */
  const KEY = 'ecoruta-demo-user';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(u) { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) { /* sin almacenamiento: la sesión dura hasta recargar */ } },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { /* nada */ } },
  };
  let user = store.get();

  const userBtn = $('#userBtn');
  const userMenu = $('#userMenu');
  function setUserMenu(open) {
    userMenu.hidden = !open;
    userBtn.setAttribute('aria-expanded', String(open));
  }
  userBtn.addEventListener('click', (e) => { e.stopPropagation(); setUserMenu(userMenu.hidden); });
  document.addEventListener('click', (e) => { if (!userMenu.hidden && !e.target.closest('.user')) setUserMenu(false); });

  function render() {
    const logged = !!user;
    $$('[data-show="guest"]').forEach((el) => { el.hidden = logged; });
    $$('[data-show="user"]').forEach((el) => { el.hidden = !logged; });
    if (logged) {
      $$('[data-user-name]').forEach((el) => { el.textContent = user.name; });
      $$('[data-user-initial]').forEach((el) => { el.textContent = user.name.charAt(0).toUpperCase(); });
      $$('[data-user-email]').forEach((el) => { el.textContent = user.email; });
    }
  }
  render();

  $$('[data-logout]').forEach((b) => b.addEventListener('click', () => {
    user = null; store.clear(); setUserMenu(false); setMenu(false); render();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Modal ---------- */
  const modal = $('#authModal');
  const dialog = $('.modal__dialog', modal);
  const views = { forms: $('#authForms'), success: $('#authSuccess') };
  const tabs = { login: $('#tab-login'), signup: $('#tab-signup') };
  const panels = { login: $('#panel-login'), signup: $('#panel-signup') };
  let lastFocus = null;

  function selectTab(name, focusTab) {
    Object.keys(tabs).forEach((k) => {
      const on = k === name;
      tabs[k].setAttribute('aria-selected', String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (focusTab) tabs[name].focus();
  }

  function openModal(tab = 'login', opts = {}) {
    lastFocus = document.activeElement;
    setMenu(false);
    views.forms.hidden = false;
    views.success.hidden = true;
    resetForms();
    selectTab(tab);
    if (opts.email) $('#signup-email').value = opts.email;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const first = tab === 'signup' ? $('#signup-name') : $('#login-email');
    setTimeout(() => first.focus(), 50);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && document.contains(lastFocus) && lastFocus.offsetParent !== null) lastFocus.focus();
  }

  $$('[data-auth-open]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.authOpen)));
  $$('[data-auth-close]', modal).forEach((b) => b.addEventListener('click', closeModal));
  $$('[data-auth-tab]', modal).forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.authTab, true)));
  Object.entries(tabs).forEach(([k, t]) => t.addEventListener('click', () => selectTab(k)));
  // Flechas para moverse entre pestañas (patrón ARIA tabs)
  $('.tabs', modal).addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      selectTab(tabs.login.getAttribute('aria-selected') === 'true' ? 'signup' : 'login', true);
    }
  });

  // Esc cierra y el foco queda atrapado dentro del modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else if (!userMenu.hidden) { setUserMenu(false); userBtn.focus(); }
      else if (nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
      return;
    }
    if (e.key === 'Tab' && !modal.hidden) {
      const f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', dialog)
        .filter((el) => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Validación ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    const err = $('#' + input.id + '-err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
    return !msg;
  }
  const rules = {
    'login-email': (v) => (!v ? 'Escribe tu correo.' : !EMAIL.test(v) ? 'Revisa el formato, por ejemplo: tu@correo.com' : ''),
    'login-pass': (v) => (!v ? 'Escribe tu contraseña.' : v.length < 8 ? 'La contraseña tiene al menos 8 caracteres.' : ''),
    'signup-name': (v) => (v.trim().length < 2 ? 'Escribe tu nombre (mínimo 2 letras).' : ''),
    'signup-email': (v) => (!v ? 'Escribe tu correo.' : !EMAIL.test(v) ? 'Revisa el formato, por ejemplo: tu@correo.com' : ''),
    'signup-pass': (v) => (v.length < 8 ? 'Usa al menos 8 caracteres.' : !(/[a-zA-Z]/.test(v) && /\d/.test(v)) ? 'Combina letras y números.' : ''),
  };
  function check(input) {
    const v = input.id.includes('pass') ? input.value : input.value.trim();
    return setError(input, rules[input.id](v));
  }

  // Valida al salir del campo y, si ya tenía error, mientras escribe
  Object.keys(rules).forEach((id) => {
    const input = $('#' + id);
    input.addEventListener('blur', () => { if (input.value) check(input); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(input); });
  });

  // Medidor de seguridad de contraseña
  const meter = $('.pw-meter');
  $('#signup-pass').addEventListener('input', (e) => {
    const v = e.target.value;
    let lvl = 0;
    if (v.length >= 1) lvl = 1;
    if (v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v)) lvl = 2;
    if (v.length >= 12 && /[a-zA-Z]/.test(v) && /\d/.test(v) && /[^a-zA-Z0-9]/.test(v)) lvl = 3;
    meter.dataset.level = String(lvl);
  });

  // Mostrar / ocultar contraseña
  $$('.pw-toggle', modal).forEach((b) => b.addEventListener('click', () => {
    const input = b.previousElementSibling;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }));

  $('[data-forgot]', modal).addEventListener('click', () => {
    const email = $('#login-email');
    const status = $('.auth-status', panels.login);
    if (!check(email)) { email.focus(); status.textContent = ''; return; }
    status.textContent = 'Simulación: te enviaríamos un enlace a ' + email.value.trim() + ' para crear una nueva contraseña.';
  });

  function resetForms() {
    Object.values(panels).forEach((f) => {
      f.reset();
      $$('input', f).forEach((i) => i.removeAttribute('aria-invalid'));
      $$('.field__err, .auth-status', f).forEach((el) => { el.textContent = ''; });
      $$('.pw-toggle', f).forEach((b) => { b.setAttribute('aria-pressed', 'false'); b.previousElementSibling.type = 'password'; });
    });
    meter.dataset.level = '0';
  }

  function fakeRequest(btn, done) {
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    $('.btn__label', btn).dataset.text = $('.btn__label', btn).textContent;
    $('.btn__label', btn).textContent = 'Un momento…';
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.removeAttribute('aria-busy');
      $('.btn__label', btn).textContent = $('.btn__label', btn).dataset.text;
      done();
    }, 900);
  }

  function success(u, isNew) {
    user = u;
    store.set(user);
    render();
    views.forms.hidden = true;
    views.success.hidden = false;
    $('#successText').textContent = isNew
      ? 'Tu cuenta de acceso anticipado está activa. Te avisaremos cuando EcoRuta esté disponible.'
      : 'Iniciaste sesión. Tu panel de impacto ya está disponible.';
    $('#successTitle').focus();
  }

  panels.login.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#login-email'), pass = $('#login-pass');
    const ok = [check(email), check(pass)];
    if (ok.includes(false)) { (ok[0] ? pass : email).focus(); return; }
    fakeRequest($('[type="submit"]', panels.login), () => {
      const saved = store.get();
      const mail = email.value.trim();
      const local = mail.split('@')[0].replace(/[._\-\d]+/g, ' ').trim() || 'viajero';
      const name = saved && saved.email === mail ? saved.name : local.charAt(0).toUpperCase() + local.slice(1);
      success({ name: name.split(' ')[0], email: mail }, false);
    });
  });

  panels.signup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#signup-name'), email = $('#signup-email'), pass = $('#signup-pass'), terms = $('#signup-terms');
    const ok = [check(name), check(email), check(pass), setError(terms, terms.checked ? '' : 'Necesitas aceptar los términos para continuar.')];
    const firstBad = [name, email, pass, terms][ok.indexOf(false)];
    if (firstBad) { firstBad.focus(); return; }
    fakeRequest($('[type="submit"]', panels.signup), () => {
      const first = name.value.trim().split(' ')[0];
      success({ name: first.charAt(0).toUpperCase() + first.slice(1), email: email.value.trim() }, true);
    });
  });

  /* ---------- CTA final → abre "Crear cuenta" con el correo ---------- */
  const ctaForm = $('#ctaForm'), ctaEmail = $('#ctaEmail'), ctaMsg = $('#ctaMsg');
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = ctaEmail.value.trim();
    if (v && !EMAIL.test(v)) {
      ctaEmail.setAttribute('aria-invalid', 'true');
      ctaMsg.className = 'form__msg err';
      ctaMsg.textContent = 'Escribe un correo válido, por ejemplo: tu@correo.com';
      ctaEmail.focus();
      return;
    }
    ctaEmail.removeAttribute('aria-invalid');
    ctaMsg.textContent = '';
    openModal('signup', { email: v });
  });

  /* ---------- Animaciones al hacer scroll ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');

    // Elementos que aparecen con un leve desplazamiento (escalonados dentro de cada grupo)
    // Solo elementos de apoyo (gráficos e imágenes): el texto aparece de inmediato (NN/g)
    const groups = ['.impact__card', '.cmp__map'];
    groups.forEach((sel) => {
      $$(sel).forEach((el) => {
        el.setAttribute('data-reveal', '');
        const sibs = [...el.parentElement.children].filter((c) => c.matches(sel));
        el.style.setProperty('--d', String(Math.max(0, sibs.indexOf(el))));
      });
    });
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('[data-reveal]').forEach((el) => revealIO.observe(el));

    // Barras que crecen y cifras que cuentan
    const bars = $('.bars');
    const counters = $$('[data-count]');
    const impactIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        if (en.target === bars) bars.classList.add('is-in');
        else countUp(en.target);
        impactIO.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    impactIO.observe(bars);
    counters.forEach((c) => { c.textContent = (c.dataset.prefix || '') + '0' + (c.dataset.suffix || ''); impactIO.observe(c); });
  }

  function countUp(el) {
    const end = Number(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const dur = 1200, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(end * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();

/* =========================================================
   Comparador interactivo (datos de referencia, sin servidor)
   ========================================================= */
(function () {
  const $ = (s) => document.querySelector(s);
  if (!$('#cmpForm')) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lugares de Lima (coordenadas aproximadas)
  const PLACES = [
    { id: 'kennedy', name: 'Parque Kennedy, Miraflores', short: 'P. Kennedy', lat: -12.1211, lng: -77.0297 },
    { id: 'sanmartin', name: 'Plaza San Martín, Cercado', short: 'Pza. San Martín', lat: -12.0516, lng: -77.0347 },
    { id: 'financiero', name: 'Centro Financiero, San Isidro', short: 'C. Financiero', lat: -12.0931, lng: -77.0262 },
    { id: 'barranco', name: 'Plaza de Barranco', short: 'Barranco', lat: -12.1495, lng: -77.0217 },
    { id: 'campo', name: 'Campo de Marte, Jesús María', short: 'Campo de Marte', lat: -12.0695, lng: -77.0436 },
    { id: 'jockey', name: 'Jockey Plaza, Surco', short: 'Jockey Plaza', lat: -12.0857, lng: -76.9773 },
    { id: 'sanmiguel', name: 'Plaza San Miguel, San Miguel', short: 'Pza. San Miguel', lat: -12.0772, lng: -77.0832 },
  ];
  // Supuestos de referencia
  const K = {
    road: 1.3,                         // factor de calles vs línea recta
    speed: { walk: 4.8, bike: 14, bus: 17 }, // km/h
    extra: { walk: 0, bike: 3, bus: 8 },     // min fijos (estacionar bici / espera)
    fare: { walk: 0, bike: 0, bus: 2.5 },    // S/
    co2: { car: 0.165, walk: 0, bike: 0, bus: 0.108 }, // kg CO2e por km (DESNZ 2024)
    carCostKm: 0.6,                    // S/ por km en auto (combustible y desgaste)
  };
  const MODES = [
    { id: 'walk', name: 'Caminar', icon: 'ic-walk', color: '#28B463', verb: 'caminando' },
    { id: 'bike', name: 'Bicicleta', icon: 'ic-bike', color: '#169C9C', verb: 'en bici' },
    { id: 'bus', name: 'Transporte público', icon: 'ic-bus', color: '#2388C9', verb: 'en transporte público' },
  ];

  const from = $('#cmpFrom'), to = $('#cmpTo'), list = $('#cmpList'), why = $('#cmpWhy'), map = $('#cmpMap');
  PLACES.forEach((p) => { from.add(new Option(p.name, p.id)); to.add(new Option(p.name, p.id)); });
  from.value = 'kennedy'; to.value = 'sanmartin';

  let active = null; // modo dibujado en el mapa (null = recomendado)

  const byId = (id) => PLACES.find((p) => p.id === id);
  function km(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h)) * K.road;
  }
  const fmtTime = (m) => { m = Math.round(m); if (m < 60) return m + ' min'; const h = Math.floor(m / 60), r = m % 60; return h + ' h ' + String(r).padStart(2, '0') + ' min'; };
  const fmtCost = (c) => 'S/ ' + c.toFixed(2);
  const fmtKg = (k) => k.toFixed(1) + ' kg';

  function compute() {
    const a = byId(from.value), b = byId(to.value);
    const d = km(a, b);
    const res = MODES.map((m) => ({
      ...m,
      time: d / K.speed[m.id] * 60 + K.extra[m.id],
      cost: K.fare[m.id],
      co2: d * (K.co2.car - K.co2[m.id]),
    }));
    // etiquetas objetivas (empate → la más rápida)
    const best = (key, dir) => [...res].sort((x, y) => (dir * (x[key] - y[key])) || (x.time - y.time))[0].id;
    const fastest = best('time', 1), cheapest = best('cost', 1), greenest = best('co2', -1);
    const prio = document.querySelector('input[name="prio"]:checked').value;
    const walk = res.find((r) => r.id === 'walk');
    let rec;
    if (prio === 'tiempo') rec = fastest;
    else if (walk.time <= 25) rec = 'walk';
    else rec = prio === 'ahorro' ? cheapest : greenest;
    return { a, b, d, res, fastest, cheapest, greenest, prio, rec };
  }

  function whyText(c) {
    const r = c.res.find((x) => x.id === c.rec), w = c.res.find((x) => x.id === 'walk');
    if (c.prio === 'tiempo') return `Te recomendamos <strong>${r.name.toLowerCase()}</strong>: es la opción más rápida para este trayecto (${fmtTime(r.time)}).`;
    if (r.id === 'walk') return `Es un trayecto corto: <strong>caminando</strong> llegas en ${fmtTime(r.time)}, sin gastar y sin emisiones.`;
    if (c.prio === 'ahorro') return `Te recomendamos <strong>${r.name.toLowerCase()}</strong>: cuesta ${fmtCost(r.cost)} y llegas ${fmtTime(w.time - r.time)} antes que caminando.`;
    return `Te recomendamos <strong>${r.name.toLowerCase()}</strong>: cero emisiones y evitas ${fmtKg(r.co2)} de CO₂ frente a ir en auto.`;
  }

  function render(animate) {
    const c = compute();
    const shown = active || c.rec;
    why.innerHTML = whyText(c);
    list.innerHTML = c.res.map((r) => {
      const tags = [];
      if (r.id === c.rec) tags.push('<span class="tag tag--green">Recomendada</span>');
      if (r.id === c.fastest) tags.push('<span class="tag tag--blue">Más rápida</span>');
      if (r.id === c.cheapest) tags.push('<span class="tag tag--soft">Más económica</span>');
      if (r.id === c.greenest) tags.push('<span class="tag tag--soft">Más sostenible</span>');
      const on = r.id === shown;
      return `<button type="button" class="opt opt--${r.id}${r.id === c.rec ? ' is-rec' : ''}${animate ? ' is-updating' : ''}" data-mode="${r.id}" aria-pressed="${on}" aria-label="${r.name}: ${fmtTime(r.time)}, ${fmtCost(r.cost)}, ${fmtKg(r.co2)} de CO₂ evitado${r.id === c.rec ? ', recomendada' : ''}. Ver en el mapa">
        <span class="opt__ic"><svg width="24" height="24" aria-hidden="true"><use href="#${r.icon}"/></svg></span>
        <span class="opt__main"><span class="opt__name">${r.name}</span><span class="opt__tags">${tags.join('')}${on ? '<span class="opt__onmap">· En el mapa</span>' : ''}</span></span>
        <span class="opt__metrics" aria-hidden="true">
          <span><small>Tiempo</small><b>${fmtTime(r.time)}</b></span>
          <span><small>Costo</small><b>${fmtCost(r.cost)}</b></span>
          <span><small>CO₂ evitado</small><b>${fmtKg(r.co2)}</b></span>
        </span>
      </button>`;
    }).join('');
    $('#cmpDist').textContent = `${c.d.toFixed(1)} km aprox. · ${c.a.short} → ${c.b.short}`;
    drawMap(c, shown);
    annual(c, shown);
  }

  // ---------- Mapa ----------
  const VW = 400, VH = 420, PAD = 48;
  const lats = PLACES.map((p) => p.lat), lngs = PLACES.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const sc = Math.min((VW - 2 * PAD) / (maxLng - minLng), (VH - 2 * PAD) / (maxLat - minLat));
  const ox = (VW - (maxLng - minLng) * sc) / 2, oy = (VH - (maxLat - minLat) * sc) / 2;
  const P = (lat, lng) => [ox + (lng - minLng) * sc, oy + (maxLat - lat) * sc];
  const COAST = [[-12.02, -77.16], [-12.075, -77.1], [-12.105, -77.058], [-12.125, -77.04], [-12.15, -77.028], [-12.2, -77.015]];
  const coastPts = COAST.map(([la, ln]) => P(la, ln));
  const seaPath = 'M' + coastPts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L') + ` L-50 ${VH + 50} L-50 -50 Z`;
  let grid = '';
  for (let x = 20; x < VW; x += 46) grid += `<path d="M${x} 0V${VH}" stroke="#fff" stroke-width="${x % 92 === 20 ? 7 : 3}"/>`;
  for (let y = 24; y < VH; y += 46) grid += `<path d="M0 ${y}H${VW}" stroke="#fff" stroke-width="${y % 92 === 24 ? 7 : 3}"/>`;
  const OFFSET = { walk: 0.06, bike: -0.1, bus: 0.22 };
  function curve(A, B, k) {
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1];
    const cx = mx - dy * k, cy = my + dx * k;
    return `M${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`;
  }
  function drawMap(c, shown) {
    const A = P(c.a.lat, c.a.lng), B = P(c.b.lat, c.b.lng);
    const alts = MODES.filter((m) => m.id !== shown).map((m) => `<path class="map-route map-route--alt" d="${curve(A, B, OFFSET[m.id])}"/>`).join('');
    const m = MODES.find((x) => x.id === shown);
    const main = `<path class="map-route map-route--active" pathLength="1" d="${curve(A, B, OFFSET[shown])}" stroke="${m.color}"${reduceMotion ? ' style="stroke-dashoffset:0;animation:none"' : ''}/>`;
    const dots = PLACES.map((p) => {
      const [x, y] = P(p.lat, p.lng), on = p.id === c.a.id || p.id === c.b.id;
      const anchor = x > VW - 90 ? 'end' : 'start', tx = anchor === 'end' ? x - 10 : x + 10;
      return (on ? '' : `<circle cx="${x}" cy="${y}" r="4" fill="#8FA79B"/>`) + `<text class="map-label${on ? ' map-label--on' : ''}" x="${tx}" y="${y + 4}" text-anchor="${anchor}">${p.short}</text>`;
    }).join('');
    map.innerHTML = `<rect width="${VW}" height="${VH}" fill="#E4EEE8"/>${grid}
      <path d="${seaPath}" fill="#CFE3EE"/><text x="18" y="${VH - 20}" class="map-label" fill="#5B8BA6" style="fill:#5B8BA6">Océano Pacífico</text>
      ${alts}${main}${dots}
      <circle cx="${A[0]}" cy="${A[1]}" r="9" fill="#fff" stroke="#0B5D46" stroke-width="4"/>
      <circle cx="${B[0]}" cy="${B[1]}" r="10" fill="#0B5D46"/><circle cx="${B[0]}" cy="${B[1]}" r="4" fill="#fff"/>`;
  }

  // ---------- Ahorro anual ----------
  const trips = $('#cmpTrips');
  function annual(c, shown) {
    const r = c.res.find((x) => x.id === shown), n = Number(trips.value);
    const save = Math.max(0, (c.d * K.carCostKm - r.cost) * n * 52);
    const co2 = r.co2 * n * 52;
    $('#cmpTripsOut').textContent = n;
    $('#cmpModeName').textContent = r.name.toLowerCase();
    $('#cmpSave').textContent = 'S/ ' + Math.round(save).toLocaleString('es-PE');
    $('#cmpCo2').textContent = Math.round(co2).toLocaleString('es-PE') + ' kg';
  }

  // ---------- Eventos ----------
  function fixSame(changed) {
    if (from.value === to.value) {
      const other = changed === from ? to : from;
      const idx = PLACES.findIndex((p) => p.id === other.value);
      other.value = PLACES[(idx + 1) % PLACES.length].id;
    }
  }
  from.addEventListener('change', () => { fixSame(from); active = null; render(true); });
  to.addEventListener('change', () => { fixSame(to); active = null; render(true); });
  $('#cmpSwap').addEventListener('click', () => { const t = from.value; from.value = to.value; to.value = t; active = null; render(true); });
  document.querySelectorAll('input[name="prio"]').forEach((r) => r.addEventListener('change', () => { active = null; render(true); }));
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.opt'); if (!b) return;
    active = b.dataset.mode; render(false);
    const nb = list.querySelector(`[data-mode="${active}"]`); if (nb) nb.focus();
  });
  trips.addEventListener('input', () => { const c = compute(); annual(c, active || c.rec); });
  render(false);
})();
