(function() {
    const MAX_FILE_SIZE_MB = 8;
    const MAX_FILES = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    function formatSize(bytes) {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function validateFiles(input) {
        const files = Array.from(input.files);
        const errorBox = document.getElementById(input.dataset.errorTarget);
        const previewBox = document.getElementById(input.dataset.previewTarget);

        if (errorBox) errorBox.innerHTML = '';
        if (previewBox) previewBox.innerHTML = '';

        if (files.length === 0) return true;

        const errors = [];

        if (files.length > MAX_FILES) {
            errors.push(`You can upload up to ${MAX_FILES} images at once (selected ${files.length}).`);
        }

        const validFiles = [];
        files.forEach(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`"${file.name}" is not a supported format. Use JPG or PNG.`);
                return;
            }
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > MAX_FILE_SIZE_MB) {
                errors.push(`"${file.name}" is ${formatSize(file.size)} — max allowed is ${MAX_FILE_SIZE_MB} MB.`);
                return;
            }
            validFiles.push(file);
        });

        if (errors.length > 0 && errorBox) {
            errorBox.innerHTML = errors.map(e =>
                `<div class="upload-error-item"><i class="fa-solid fa-circle-exclamation"></i> ${e}</div>`
            ).join('');
        }

        // Show preview thumbnails for valid files
        if (previewBox && validFiles.length > 0) {
            validFiles.slice(0, MAX_FILES).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const thumb = document.createElement('div');
                    thumb.className = 'upload-preview-thumb';
                    thumb.innerHTML = `
                        <img src="${e.target.result}" alt="">
                        <span class="upload-preview-size">${formatSize(file.size)}</span>
                    `;
                    previewBox.appendChild(thumb);
                };
                reader.readAsDataURL(file);
            });
        }

        return errors.length === 0;
    }

    document.querySelectorAll('input[type="file"][data-validate-images]').forEach(input => {
        input.addEventListener('change', () => validateFiles(input));

        // Block submit if there are validation errors
        const form = input.closest('form');
        form?.addEventListener('submit', (e) => {
            const errorBox = document.getElementById(input.dataset.errorTarget);
            if (errorBox && errorBox.children.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
})();