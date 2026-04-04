// Check if listing and geometry exist to prevent crashes
if (listing && listing.geometry && listing.geometry.coordinates) {
    // MongoDB stores [Lng, Lat]. Leaflet NEEDS [Lat, Lng].
    const lat = listing.geometry.coordinates[1];
    const lng = listing.geometry.coordinates[0];
    const coords = [lat, lng];

    // Initialize map
    const map = L.map('map').setView(coords, 13);

// Use this temporarily to see if the map shows up
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);
    // Add Marker
    L.marker(coords).addTo(map)
        .bindPopup(`<b>${listing.title}</b><br>Exact location shared after booking.`)
        .openPopup();
} else {
    console.error("Map Error: Listing coordinates are missing!");
}