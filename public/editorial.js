'use strict';

(() => {
  const header = document.querySelector('#siteHeader');
  let framePending = false;
  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 36);
    framePending = false;
  };
  updateHeader();
  window.addEventListener('scroll', () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateHeader); }
  }, {passive:true});

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, {threshold:0.08});
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const looks = [...document.querySelectorAll('[data-editorial-product]')];
  for (const link of looks) {
    const id = link.dataset.editorialProduct;
    const product = typeof catalogProduct === 'function' ? catalogProduct(id) : null;
    link.hidden = !product;
    if (!product) continue;
    const colors = availableColors(id);
    const params = new URL(link.href).searchParams;
    const requested = params.get('color');
    const color = colors.includes(requested) ? requested : colors[0];
    link.href = '?product=' + encodeURIComponent(id) + '&color=' + encodeURIComponent(color);
  }
  const strip = document.querySelector('.collection-strip');
  if (strip && looks.length) strip.hidden = looks.every(link => link.hidden);

  const menuButton = document.querySelector('#menuOpen');
  const menu = document.querySelector('#mobileMenu');
  if (menuButton && menu) {
    menuButton.setAttribute('aria-controls', 'mobileMenu');
    menuButton.setAttribute('aria-haspopup', 'dialog');
    menuButton.setAttribute('aria-expanded', String(menu.open));
    menuButton.addEventListener('click', () => menuButton.setAttribute('aria-expanded', String(menu.open)));
    menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
  }
  const searchButton = document.querySelector('#searchToggle');
  const searchBox = document.querySelector('.searchbox');
  if (searchButton && searchBox) {
    searchBox.id = searchBox.id || 'storeSearch';
    searchButton.setAttribute('aria-controls', searchBox.id);
    searchButton.setAttribute('aria-expanded', String(searchBox.classList.contains('open')));
    searchButton.addEventListener('click', () => searchButton.setAttribute('aria-expanded', String(searchBox.classList.contains('open'))));
  }
})();
