// =====================
// Lightbox (Fullscreen Images + Arrows)
// =====================

const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));

let currentIndex = 0;
let lightboxEl = null;
let prevBodyOverflow = '';

function openLightbox(index) {
    currentIndex = index;

    // Overlay
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox is-open';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');

    // Image
    const fullImg = document.createElement('img');
    fullImg.className = 'lightbox__img';
    fullImg.src = lightboxImgs[currentIndex].src;
    fullImg.alt = lightboxImgs[currentIndex].alt || '';

    // Buttons
    const btnPrev = document.createElement('button');
    btnPrev.className = 'lightbox__btn lightbox__btn--prev';
    btnPrev.setAttribute('aria-label', 'Previous image');
    btnPrev.innerHTML = '&#10094;'; // ‹

    const btnNext = document.createElement('button');
    btnNext.className = 'lightbox__btn lightbox__btn--next';
    btnNext.setAttribute('aria-label', 'Next image');
    btnNext.innerHTML = '&#10095;'; // ›

    const btnClose = document.createElement('button');
    btnClose.className = 'lightbox__btn lightbox__btn--close';
    btnClose.setAttribute('aria-label', 'Close');
    btnClose.innerHTML = '&times;';

    // Append
    lightboxEl.appendChild(btnPrev);
    lightboxEl.appendChild(fullImg);
    lightboxEl.appendChild(btnNext);
    lightboxEl.appendChild(btnClose);
    document.body.appendChild(lightboxEl);

    // Lock scroll
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Click outside closes
    lightboxEl.addEventListener('click', closeLightbox);

    // Stop propagation
    fullImg.addEventListener('click', (e) => e.stopPropagation());
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', onLightboxKeydown);
}

function closeLightbox() {
    if (!lightboxEl) return;

    document.removeEventListener('keydown', onLightboxKeydown);
    lightboxEl.remove();
    lightboxEl = null;

    document.body.style.overflow = prevBodyOverflow;
}

function showImage(index) {
    currentIndex = (index + lightboxImgs.length) % lightboxImgs.length;

    const imgEl = document.querySelector('.lightbox__img');
    if (!imgEl) return;

    imgEl.src = lightboxImgs[currentIndex].src;
    imgEl.alt = lightboxImgs[currentIndex].alt || '';
}

function nextImage() {
    showImage(currentIndex + 1);
}

function prevImage() {
    showImage(currentIndex - 1);
}

function onLightboxKeydown(ev) {
    if (ev.key === 'Escape') closeLightbox();
    if (ev.key === 'ArrowRight') nextImage();
    if (ev.key === 'ArrowLeft') prevImage();
}

// Attach image click listeners
lightboxImgs.forEach((img, index) => {
    img.addEventListener('click', (e) => {
        const link = img.closest('a');
        if (link) e.preventDefault();
        openLightbox(index);
    });
});


// =====================
// Burger Navigation
// =====================

const navToggle = document.querySelector('.navToggle');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        // Optional: block burger when lightbox is open
        if (document.querySelector('.lightbox')) return;
        document.body.classList.toggle('nav-open');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    });
});
