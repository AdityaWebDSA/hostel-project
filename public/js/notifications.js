(() => {
  const bellToggle = document.getElementById('notifBellToggle');
  const dropdownContent = document.getElementById('notifDropdownContent');
  const badge = document.getElementById('notifBadge');

  if (!bellToggle) return;

  let loaded = false;

  bellToggle.addEventListener('click', async () => {
    if (loaded) return;
    loaded = true;
    try {
      const res = await fetch('/notifications');
      // We only have a full-page route, so for the dropdown preview we fetch unread count
      // and show a simple "open full page" prompt instead of re-parsing HTML.
      dropdownContent.innerHTML = `<a href="/notifications" class="dropdown-item-text small text-center d-block py-2">Click "See all" to view your notifications</a>`;
    } catch (err) {
      dropdownContent.innerHTML = `<span class="dropdown-item-text text-muted small">Couldn't load notifications</span>`;
    }
  });

  // Poll unread count every 30s so the badge updates without a full page reload
  setInterval(async () => {
    try {
      const res = await fetch('/notifications/unread-count');
      if (!res.ok) return;
      const data = await res.json();
      const bell = document.getElementById('notifBellToggle');
      if (!bell) return;

      let badgeEl = document.getElementById('notifBadge');
      if (data.count > 0) {
        if (!badgeEl) {
          badgeEl = document.createElement('span');
          badgeEl.className = 'notif-badge';
          badgeEl.id = 'notifBadge';
          bell.appendChild(badgeEl);
        }
        badgeEl.textContent = data.count > 9 ? '9+' : data.count;
      } else if (badgeEl) {
        badgeEl.remove();
      }
    } catch (err) {
      // Silent fail - polling shouldn't disrupt the page
    }
  }, 30000);
})();