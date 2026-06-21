async function toggleSave(el) {
    const listingId = el.dataset.listingId;
    if (!listingId) return;

    try {
        const res = await fetch(`/saved/toggle/${listingId}`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to toggle save");
        const data = await res.json();

        const icon = el.querySelector('i');
        if (data.saved) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid', 'saved');
            const label = el.querySelector('span');
            if (label) label.textContent = 'Saved';
        } else {
            icon.classList.remove('fa-solid', 'saved');
            icon.classList.add('fa-regular');
            const label = el.querySelector('span');
            if (label) label.textContent = 'Save to Wishlist';
        }
    } catch (err) {
        console.error("Save toggle error:", err);
    }
}