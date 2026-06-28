const _saveInFlight = new Set();

async function toggleSave(el) {
    const listingId = el.dataset.listingId;
    if (!listingId || _saveInFlight.has(listingId)) return;
    _saveInFlight.add(listingId);

    const icon = el.querySelector('i');
    const label = el.querySelector('span');
    const prevClass = icon.className;

    // Immediate feedback — spinner replaces icon
    icon.className = 'fa-solid fa-spinner fa-spin';
    el.style.opacity = '0.7';
    el.style.pointerEvents = 'none';

    try {
        const res = await fetch(`/saved/toggle/${listingId}`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();

        if (data.saved) {
            icon.className = 'fa-solid fa-heart saved';
            if (label) label.textContent = 'Saved';
            // Brief scale-up animation to confirm the action
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => icon.style.transform = '', 200);
        } else {
            icon.className = 'fa-regular fa-heart';
            if (label) label.textContent = 'Save to Wishlist';
        }
    } catch (err) {
        icon.className = prevClass; // restore on error
        console.error('Save toggle error:', err);
    } finally {
        el.style.opacity = '';
        el.style.pointerEvents = '';
        _saveInFlight.delete(listingId);
    }
}