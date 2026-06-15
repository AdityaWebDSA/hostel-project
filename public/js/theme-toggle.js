(() => {
  const btn = document.getElementById('theme-toggle');
  const icon = btn?.querySelector('i');

  function updateIcon(theme) {
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  // Sync icon with whatever theme the anti-flash script already set
  updateIcon(document.documentElement.getAttribute('data-theme') || 'light');

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  });
})();