'use strict';

(() => {
  const menu = document.querySelector('#mobileMenu');
  for (const id of ['favoritesOpen', 'guide']) {
    const button = document.querySelector('#' + id);
    const action = button?.onclick;
    if (!button || typeof action !== 'function') continue;
    button.onclick = event => {
      if (menu?.open) menu.close();
      action.call(button, event);
    };
  }

  // These links reuse the real catalog, with no invented accessory products.
  document.querySelectorAll('[data-collection-view]').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.collectionView;
      if (typeof catalogLoadError !== 'undefined' && catalogLoadError) return;
      searchInput.value = view === 'accessories' ? 'اکسسوری' : '';
      favoritesOnly = false;
      if (view === 'new') sortProducts.value = 'featured';
      selectCategory('همه');
      if (menu?.open) menu.close();
    });
  });
})();
