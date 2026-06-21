// Inserts Cloudinary transformation params into an existing image URL.
// Cloudinary URLs look like: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg
// We inject transforms right after "/upload/".
function transformUrl(url, transform) {
    if (!url || typeof url !== "string") return url;
    if (!url.includes("/upload/")) return url; // not a Cloudinary URL, return as-is
    return url.replace("/upload/", `/upload/${transform}/`);
}

// Card thumbnail: small, cropped to fill, auto format (WebP/AVIF) + auto quality
function cardThumb(url) {
    return transformUrl(url, "w_500,h_350,c_fill,g_auto,f_auto,q_auto");
}

// Listing detail main image: larger, fit within bounds, auto format/quality
function detailImage(url) {
    return transformUrl(url, "w_1200,c_limit,f_auto,q_auto");
}

// Small thumbnail (gallery side images, avatars-in-cards etc.)
function smallThumb(url) {
    return transformUrl(url, "w_300,h_300,c_fill,g_auto,f_auto,q_auto");
}

module.exports = { transformUrl, cardThumb, detailImage, smallThumb };