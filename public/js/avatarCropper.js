(function() {
    const MAX_FILE_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    const CROP_SIZE = 280; // px, the visible circular crop canvas size
    const OUTPUT_SIZE = 500; // px, final exported image resolution

    let state = {
        img: null,
        scale: 1,
        minScale: 1,
        offsetX: 0,
        offsetY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
    };

    const input = document.getElementById('avatarInput');
    if (!input) return;

    const modal = document.getElementById('avatarCropModal');
    const canvas = document.getElementById('avatarCropCanvas');
    const ctx = canvas.getContext('2d');
    const zoomSlider = document.getElementById('avatarZoomSlider');
    const errorBox = document.getElementById('avatarUploadError');
    const hiddenFileInput = document.getElementById('avatarCroppedFile');

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        errorBox.innerHTML = '';
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            errorBox.innerHTML = `<div class="upload-error-item"><i class="fa-solid fa-circle-exclamation"></i> "${file.name}" is not a supported format. Use JPG or PNG.</div>`;
            input.value = '';
            return;
        }
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_FILE_SIZE_MB) {
            errorBox.innerHTML = `<div class="upload-error-item"><i class="fa-solid fa-circle-exclamation"></i> Image is ${sizeMB.toFixed(1)} MB — max allowed is ${MAX_FILE_SIZE_MB} MB.</div>`;
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => openCropper(img);
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    function openCropper(img) {
        state.img = img;
        const minScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
        state.scale = minScale;
        state.minScale = minScale;
        state.offsetX = 0;
        state.offsetY = 0;
        zoomSlider.value = 0;
        modal.classList.add('crop-modal-active');
        document.body.style.overflow = 'hidden';
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
        ctx.save();

        // Circular clip
        ctx.beginPath();
        ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
        ctx.clip();

        const w = state.img.width * state.scale;
        const h = state.img.height * state.scale;
        const x = (CROP_SIZE - w) / 2 + state.offsetX;
        const y = (CROP_SIZE - h) / 2 + state.offsetY;

        ctx.drawImage(state.img, x, y, w, h);
        ctx.restore();

        // Subtle ring overlay
        ctx.beginPath();
        ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2 - 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function clampOffsets() {
        const w = state.img.width * state.scale;
        const h = state.img.height * state.scale;
        const maxOffsetX = Math.max(0, (w - CROP_SIZE) / 2);
        const maxOffsetY = Math.max(0, (h - CROP_SIZE) / 2);
        state.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, state.offsetX));
        state.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, state.offsetY));
    }

    // Drag to reposition
    canvas.addEventListener('mousedown', (e) => {
        state.dragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
        if (!state.dragging) return;
        state.offsetX += e.clientX - state.lastX;
        state.offsetY += e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        clampOffsets();
        draw();
    });
    window.addEventListener('mouseup', () => state.dragging = false);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        state.dragging = true;
        state.lastX = e.touches[0].clientX;
        state.lastY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchmove', (e) => {
        if (!state.dragging) return;
        e.preventDefault();
        state.offsetX += e.touches[0].clientX - state.lastX;
        state.offsetY += e.touches[0].clientY - state.lastY;
        state.lastX = e.touches[0].clientX;
        state.lastY = e.touches[0].clientY;
        clampOffsets();
        draw();
    }, { passive: false });
    canvas.addEventListener('touchend', () => state.dragging = false);

    // Zoom slider
    zoomSlider.addEventListener('input', () => {
        const zoomFactor = 1 + (parseInt(zoomSlider.value) / 100) * 2; // up to 3x zoom
        state.scale = state.minScale * zoomFactor;
        clampOffsets();
        draw();
    });

    // Scroll wheel zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        let newVal = parseInt(zoomSlider.value) + delta;
        newVal = Math.max(0, Math.min(100, newVal));
        zoomSlider.value = newVal;
        zoomSlider.dispatchEvent(new Event('input'));
    });

    window.cancelAvatarCrop = function() {
        modal.classList.remove('crop-modal-active');
        document.body.style.overflow = '';
        input.value = '';
    };

    window.confirmAvatarCrop = function() {
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = OUTPUT_SIZE;
        outputCanvas.height = OUTPUT_SIZE;
        const outCtx = outputCanvas.getContext('2d');

        const scaleRatio = OUTPUT_SIZE / CROP_SIZE;
        outCtx.save();
        outCtx.beginPath();
        outCtx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
        outCtx.clip();

        const w = state.img.width * state.scale * scaleRatio;
        const h = state.img.height * state.scale * scaleRatio;
        const x = (OUTPUT_SIZE - w) / 2 + state.offsetX * scaleRatio;
        const y = (OUTPUT_SIZE - h) / 2 + state.offsetY * scaleRatio;

        outCtx.drawImage(state.img, x, y, w, h);
        outCtx.restore();

        outputCanvas.toBlob((blob) => {
            const file = new File([blob], 'avatar.png', { type: 'image/png' });
            const dt = new DataTransfer();
            dt.items.add(file);
            hiddenFileInput.files = dt.files;

            // Update live preview on the page
            const wrap = document.getElementById('avatarPreviewWrap');
            const url = URL.createObjectURL(blob);
            wrap.innerHTML = `<img src="${url}" id="avatarPreview" alt="">`;

            modal.classList.remove('crop-modal-active');
            document.body.style.overflow = '';
        }, 'image/png', 0.92);
    };
})();