// =====================
// Lightbox (Fullscreen Images + Arrows)
// Thumbnail grid -> Full image in lightbox via <a href="FULL.webp">
// =====================

// Collect thumbnails (the <img> elements in your grid)
const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));

// If this page has no lightbox images (e.g., writing.html/about.html), stop safely.
if (lightboxImgs.length === 0) {
  // Nothing to do on this page.
} else {
  let currentIndex = 0;
  let lightboxEl = null;
  let prevBodyOverflow = '';

  function getFullSrc(index) {
    const img = lightboxImgs[index];
    if (!img) return '';
    const link = img.closest('a');
    // Use <a href="..."> as full image, fallback to thumbnail src if missing
    return (link && link.getAttribute('href')) ? link.getAttribute('href') : img.src;
  }

  function preloadNeighbors() {
    if (lightboxImgs.length < 2) return;

    const nextIndex = (currentIndex + 1) % lightboxImgs.length;
    const prevIndex = (currentIndex - 1 + lightboxImgs.length) % lightboxImgs.length;

    const nextSrc = getFullSrc(nextIndex);
    const prevSrc = getFullSrc(prevIndex);

    if (nextSrc) {
      const n = new Image();
      n.src = nextSrc;
    }
    if (prevSrc) {
      const p = new Image();
      p.src = prevSrc;
    }
  }

  function showImage(index) {
    currentIndex = (index + lightboxImgs.length) % lightboxImgs.length;

    const imgEl = document.querySelector('.lightbox__img');
    if (!imgEl) return;

    imgEl.src = getFullSrc(currentIndex);
    imgEl.alt = lightboxImgs[currentIndex].alt || '';

    preloadNeighbors();
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

    // Image (fullsize)
    const fullImg = document.createElement('img');
    fullImg.className = 'lightbox__img';
    fullImg.src = getFullSrc(currentIndex);
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

    // Stop propagation (so clicks on image/buttons don't close)
    fullImg.addEventListener('click', (e) => e.stopPropagation());
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', onLightboxKeydown);

    // Preload neighbors for instant arrow navigation
    preloadNeighbors();
  }

  // Attach click listeners to thumbnails
  lightboxImgs.forEach((img, index) => {
    img.addEventListener('click', (e) => {
      const link = img.closest('a');
      if (link) e.preventDefault(); // prevents "#" jump or navigating to href
      openLightbox(index);
    });
  });
}
