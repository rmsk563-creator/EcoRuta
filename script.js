// EcoRuta — interacciones de la landing
(function () {
  const header = document.querySelector('.header');
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');

  // Header con borde al hacer scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  // Enlace activo según la sección visible
  const links = [...document.querySelectorAll('.nav__list a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  // Formulario demostrativo (no envía ni guarda datos)
  const form = document.getElementById('form');
  const email = document.getElementById('email');
  const msg = document.getElementById('form-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    email.setAttribute('aria-invalid', String(!valid));
    msg.className = 'form__msg ' + (valid ? 'ok' : 'err');
    msg.textContent = valid
      ? '¡Listo! Te avisaremos cuando EcoRuta esté disponible.'
      : 'Escribe un correo válido, por ejemplo: tu@correo.com';
    if (valid) form.reset(); else email.focus();
  });
})();
