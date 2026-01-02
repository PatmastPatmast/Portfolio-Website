// =====================
// Lightbox (Fullscreen Images + Arrows)
// Thumbnail grid -> Full image via <a href="FULL.webp">
// =====================

// Collect thumbnails
const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));

// If no lightbox images on this page, do nothing
if (lightboxImgs.length > 0) {

  let currentIndex = 0;
  let lightboxEl = null;
  let prevBodyOverflow = '';

  function getFullSrc(index) {
    const img = lightboxImgs[index];
    if (!img) return '';

    const link = img.closest('a');
    const href = link ? link.getAttribute('href') : '';

    // Fallback if href is missing or "#"
    if (!href || href === '#') return img.src;

    return href;
  }

  function showImage(index) {
    currentIndex = (index + lightboxImgs.length) % lightboxImgs.length;

    const imgEl = document.querySelector('.lightbox__img');
    if (!imgEl) return;

    imgEl.src = getFullSrc(currentIndex);
    imgEl.alt = lightboxImgs[currentIndex].alt || '';
  }

  function nextImage() {
    showImage(currentIndex + 1);
  }

  function prevImage() {
    showImage(currentIndex - 1);
  }

  function onLightboxKeydown(ev) {
    if (!lightboxEl) return;

    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeLightbox();
    }

    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      nextImage();
    }

    if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      prevImage();
    }
  }

  function closeLightbox() {
    if (!lightboxEl) return;

    document.removeEventListener('keydown', onLightboxKeydown);
    lightboxEl.remove();
    lightboxEl = null;

    document.body.style.overflow = prevBodyOverflow;
  }

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
    fullImg.src = getFullSrc(currentIndex);
    fullImg.alt = lightboxImgs[currentIndex].alt || '';

    // Buttons
    const btnPrev = document.createElement('button');
    btnPrev.className = 'lightbox__btn lightbox__btn--prev';
    btnPrev.setAttribute('aria-label', 'Previous image');
    btnPrev.innerHTML = '&#10094;';

    const btnNext = document.createElement('button');
    btnNext.className = 'lightbox__btn lightbox__btn--next';
    btnNext.setAttribute('aria-label', 'Next image');
    btnNext.innerHTML = '&#10095;';

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

  // Attach click listeners
  lightboxImgs.forEach((img, index) => {
    img.addEventListener('click', (e) => {
      const link = img.closest('a');
      if (link) e.preventDefault();
      openLightbox(index);
    });
  });
}
