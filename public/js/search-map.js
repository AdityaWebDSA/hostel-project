(function () {
    // Only run on the listings index page
    if (!document.getElementById('searchMap')) return;

    const ctx = window.__UNINEST__ || {};
    let map = null;
    let markers = [];
    let userMarker = null;

    const panel = document.getElementById('searchMapPanel');
    const mapTitle = document.getElementById('searchMapTitle');
    const mapResults = document.getElementById('searchMapResults');
    const nearMeBtn = document.getElementById('nearMeBtn');
    const nearMeStatus = document.getElementById('nearMeStatus');
    const closeBtn = document.getElementById('closeMapPanel');

    // --- Init map (lazy - only when first shown) ---
    function initMap(lat, lng, zoom = 13) {
        if (!map) {
            map = L.map('searchMap', { zoomControl: true }).setView([lat, lng], zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);
        } else {
            map.setView([lat, lng], zoom);
        }
        setTimeout(() => map.invalidateSize(), 100);
    }

    function clearMarkers() {
        markers.forEach(m => m.remove());
        markers = [];
    }

    function showPanel() {
        panel.style.display = 'block';
        setTimeout(() => panel.classList.add('panel-visible'), 10);
        setTimeout(() => map && map.invalidateSize(), 350);
    }

    function hidePanel() {
        panel.classList.remove('panel-visible');
        setTimeout(() => { panel.style.display = 'none'; }, 300);
    }

    closeBtn?.addEventListener('click', hidePanel);

    // --- Price label helper ---
    function priceLabel(listing) {
        if (!listing.price || listing.price === 0) return 'Free';
        const plans = { monthly: '/mo', yearly: '/yr', halfyearly: '/6mo', quarterly: '/3mo', weekly: '/wk', onetime: ' once' };
        const suffix = plans[listing.pricePlan] || '';
        return `₹${listing.price.toLocaleString('en-IN')}${suffix}`;
    }

    // --- Drop pins for a list of listings ---
    function dropPins(listings, centerLat, centerLng) {
        clearMarkers();
        mapResults.innerHTML = '';

        if (listings.length === 0) {
            mapResults.innerHTML = `<div class="map-no-results"><i class="fa-solid fa-magnifying-glass"></i><p>No listings found nearby</p></div>`;
            return;
        }

        // Center search marker (pulsing dot)
        const centerIcon = L.divIcon({
            className: '',
            html: `<div class="search-center-pin"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
        const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon }).addTo(map);
        markers.push(centerMarker);

        listings.forEach((listing, idx) => {
            if (!listing.lat || !listing.lng) return;

            const pinIcon = L.divIcon({
                className: '',
                html: `<div class="listing-pin" data-id="${listing.id}">
                           <span>${priceLabel(listing)}</span>
                       </div>`,
                iconSize: [80, 32],
                iconAnchor: [40, 32],
            });

            const marker = L.marker([listing.lat, listing.lng], { icon: pinIcon }).addTo(map);
            marker.bindPopup(`
                <div class="map-popup">
                    ${listing.image ? `<img src="${listing.image.replace('/upload', '/upload/w_220,h_130,c_fill')}" class="map-popup-img">` : ''}
                    <div class="map-popup-body">
                        <b>${listing.title}</b>
                        <p>${listing.location || ''}</p>
                        <a href="/listings/${listing.id}" class="map-popup-link">View listing →</a>
                    </div>
                </div>
            `);

            marker.on('click', () => {
                // Highlight corresponding sidebar card
                document.querySelectorAll('.map-result-card').forEach(c => c.classList.remove('active'));
                const card = document.getElementById(`map-card-${listing.id}`);
                if (card) {
                    card.classList.add('active');
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            markers.push(marker);

            // Sidebar result card
            const card = document.createElement('a');
            card.href = `/listings/${listing.id}`;
            card.className = 'map-result-card';
            card.id = `map-card-${listing.id}`;
            card.innerHTML = `
                ${listing.image ? `<img src="${listing.image.replace('/upload', '/upload/w_80,h_60,c_fill')}" class="map-card-img">` : '<div class="map-card-img-placeholder"><i class="fa-solid fa-house"></i></div>'}
                <div class="map-card-info">
                    <div class="map-card-title">${listing.title}</div>
                    <div class="map-card-loc"><i class="fa-solid fa-location-dot"></i> ${listing.location || 'Unknown'}</div>
                    <div class="map-card-price">${priceLabel(listing)}</div>
                </div>
            `;
            card.addEventListener('mouseenter', () => {
                const pin = document.querySelector(`.listing-pin[data-id="${listing.id}"]`);
                if (pin) pin.classList.add('pin-hover');
                marker.openPopup();
            });
            card.addEventListener('mouseleave', () => {
                const pin = document.querySelector(`.listing-pin[data-id="${listing.id}"]`);
                if (pin) pin.classList.remove('pin-hover');
            });
            mapResults.appendChild(card);
        });

        // Fit map to show all markers
        if (listings.length > 0) {
            const bounds = L.latLngBounds(
                listings.filter(l => l.lat && l.lng).map(l => [l.lat, l.lng])
            );
            bounds.extend([centerLat, centerLng]);
            map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
        }
    }

    // --- Fetch and display nearby listings ---
    async function loadNearby(lat, lng, label, category = '') {
        initMap(lat, lng, 13);
        showPanel();
        mapTitle.textContent = label;
        mapResults.innerHTML = `<div class="search-map-loading"><i class="fa-solid fa-spinner fa-spin"></i> Finding nearby places...</div>`;

        try {
            const params = new URLSearchParams({ lat, lng, radius: 5000 });
            if (category) params.set('category', category);

            const res = await fetch(`/listings/nearby?${params}`);
            const data = await res.json();
            dropPins(data.listings, lat, lng);
        } catch (err) {
            mapResults.innerHTML = `<div class="map-no-results"><i class="fa-solid fa-triangle-exclamation"></i><p>Couldn't load nearby listings</p></div>`;
        }
    }

    // --- "Near Me" button ---
    nearMeBtn?.addEventListener('click', () => {
        if (!navigator.geolocation) {
            nearMeStatus.textContent = 'Location not supported by your browser';
            return;
        }
        nearMeStatus.textContent = 'Detecting your location...';
        nearMeBtn.disabled = true;
        nearMeBtn.querySelector('span').textContent = 'Detecting...';

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                nearMeStatus.textContent = '';
                nearMeBtn.disabled = false;
                nearMeBtn.querySelector('span').textContent = 'Show listings near me';
                await loadNearby(lat, lng, 'Near your current location', ctx.currentCategory);
            },
            (err) => {
                nearMeStatus.textContent = 'Location access denied — please allow location or type a location in the search bar.';
                nearMeBtn.disabled = false;
                nearMeBtn.querySelector('span').textContent = 'Show listings near me';
            }
        );
    });

    // --- Auto-load if a search just returned a geocoded center ---
    if (ctx.searchCenter && ctx.searchCenter.lat && ctx.searchCenter.lng) {
        const { lat, lng } = ctx.searchCenter;
        // Use async IIFE so we don't block page render
        (async () => {
            initMap(lat, lng, 14);
            showPanel();
            mapTitle.textContent = ctx.searchQuery ? `Near "${ctx.searchQuery}"` : 'Search results';
            await loadNearby(lat, lng, mapTitle.textContent, ctx.currentCategory);
        })();
    }

    // --- Intercept the navbar search form for instant map update ---
    const searchForm = document.querySelector('.search-form');
    searchForm?.addEventListener('submit', async (e) => {
        const q = searchForm.querySelector('[name="q"]').value.trim();
        if (!q) return; // let the form submit normally (redirect to /listings)

        // Don't prevent — let the normal server-side search happen.
        // The page will reload with ctx.searchCenter set, which triggers the auto-load above.
        // For a SPA-style instant update without page reload, this is where you'd preventDefault()
        // and call the geocode-preview + loadNearby yourself — but a full page reload is
        // simpler, more reliable, and gives correct pagination/sort state.
    });

})();