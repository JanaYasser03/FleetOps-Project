(function () {
  let timer;
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  window.FleetOps = { toast, icons: () => window.lucide && lucide.createIcons() };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const rail = document.getElementById('rail');
    const menu = document.getElementById('mobileMenu');
    if (menu && rail) {
      menu.addEventListener('click', () => rail.classList.toggle('open'));
      document.addEventListener('click', e => {
        if (rail.classList.contains('open') && !rail.contains(e.target) && !menu.contains(e.target)) rail.classList.remove('open');
      });
    }

    document.querySelectorAll('[data-toast]').forEach(el =>
      el.addEventListener('click', e => { e.preventDefault(); toast(el.dataset.toast); }));

    const search = document.getElementById('globalSearch');
    if (search) search.addEventListener('keydown', e => {
      if (e.key === 'Enter') toast('Search will connect to FleetOps data in the backend phase.');
    });
  });
})();
