// Global loading state handler for forms
// Add data-loading-text="Saving..." to any submit button to get automatic loading state
document.addEventListener('DOMContentLoaded', () => {

    // Handle all forms with a [data-loading-text] submit button
    document.querySelectorAll('form').forEach(form => {
        const btn = form.querySelector('[data-loading-text]');
        if (!btn) return;

        form.addEventListener('submit', function() {
            if (!form.checkValidity()) return;
            const loadingText = btn.dataset.loadingText || 'Loading...';
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i>${loadingText}`;
            // Safety restore after 10s in case of server error with no redirect
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }, 10000);
        });
    });

    // Global page transition overlay (for slow server responses on full-page forms)
    document.querySelectorAll('form[data-page-loading]').forEach(form => {
        form.addEventListener('submit', function() {
            if (!form.checkValidity()) return;
            showPageLoader();
        });
    });
});

function showPageLoader() {
    const existing = document.getElementById('pageLoader');
    if (existing) return;
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div class="page-loader-inner">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Loading...</span>
        </div>
    `;
    document.body.appendChild(loader);
    requestAnimationFrame(() => loader.classList.add('loader-visible'));
}