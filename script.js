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
    const groups = ['.section__head', '.grid-3 > *', '.steps > *', '.modes > *', '.faq > *', '.impact__grid > *', '.cta__box', '.footnote'];
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
