// =====================
// Lightbox (Fullscreen Images + Arrows + Pointer Swipe + Animations)
// Thumbnail grid -> Full image via <a href="FULL.webp">
// =====================

// Collect thumbnails
const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));

// If no lightbox images on this page, do nothing
if (lightboxImgs.length > 0) {

  let currentIndex = 0;
  let lightboxEl = null;
  let prevBodyOverflow = '';

  function getLightboxImgEl() {
    return document.querySelector('.lightbox__img');
  }

  // ---- JS-only animation helpers ----
  function animateOpen(imgEl) {
    if (!imgEl) return;

    imgEl.style.willChange = 'transform, opacity';
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.98)';

    requestAnimationFrame(() => {
      imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    });
  }

  function fadeSwitchTo(index) {
    // used by showImage to fade between images
    const imgEl = getLightboxImgEl();
    if (!imgEl) return;

    imgEl.style.transition = 'opacity 120ms ease';
    imgEl.style.opacity = '0';

    setTimeout(() => {
      imgEl.src = getFullSrc(index);
      imgEl.alt = lightboxImgs[index].alt || '';

      imgEl.style.transition = 'opacity 160ms ease';
      imgEl.style.opacity = '1';

      setTimeout(() => {
        imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
        imgEl.style.transform = 'translateX(0) scale(1)';
      }, 180);
    }, 120);
  }

  // =====================
  // Pointer Swipe (replaces touch swipe)
  // =====================

  let pStartX = 0;
  let pStartY = 0;
  let pDeltaX = 0;
  let pDeltaY = 0;
  let pStartTime = 0;
  let swipeLocked = null;     // null | 'x' | 'y'
  let activePointerId = null; // track single pointer

  const INTENT_PX = 12;        // movement before locking direction
  const SWIPE_DIST = 70;       // distance trigger
  const SWIPE_VELOCITY = 0.35; // speed trigger (px/ms)
  const DRAG_FACTOR = 0.9;     // how much the image follows finger

  function setDragTransform(x) {
    const img = getLightboxImgEl();
    if (!img) return;
    img.style.transition = 'none';
    img.style.transform = `translateX(${x}px) scale(1)`;
  }

  function snapBack() {
    const img = getLightboxImgEl();
    if (!img) return;
    img.style.transition = 'transform 160ms ease';
    img.style.transform = 'translateX(0) scale(1)';
  }

  function snapOut(dir) {
    // dir: +1 (next) or -1 (prev)
    const img = getLightboxImgEl();
    if (!img) return;

    img.style.transition = 'transform 140ms ease';
    img.style.transform = `translateX(${dir * -80}px) scale(1)`;

    setTimeout(() => {
      const i = getLightboxImgEl();
      if (!i) return;
      i.style.transition = 'transform 0ms linear';
      i.style.transform = 'translateX(0) scale(1)';
    }, 140);
  }

  function onPointerDown(e) {
    if (!lightboxEl) return;
    if (activePointerId !== null) return;

    activePointerId = e.pointerId;
    lightboxEl.setPointerCapture?.(activePointerId);

    pStartX = e.clientX;
    pStartY = e.clientY;
    pDeltaX = 0;
    pDeltaY = 0;
    pStartTime = performance.now();
    swipeLocked = null;
  }

  function onPointerMove(e) {
    if (!lightboxEl) return;
    if (e.pointerId !== activePointerId) return;

    pDeltaX = e.clientX - pStartX;
    pDeltaY = e.clientY - pStartY;

    // Lock direction after intent threshold
    if (swipeLocked === null) {
      if (Math.abs(pDeltaX) > INTENT_PX || Math.abs(pDeltaY) > INTENT_PX) {
        swipeLocked = (Math.abs(pDeltaX) > Math.abs(pDeltaY)) ? 'x' : 'y';
      } else {
        return;
      }
    }

    // Horizontal swipe: prevent scroll + drag image
    if (swipeLocked === 'x') {
      e.preventDefault();
      setDragTransform(pDeltaX * DRAG_FACTOR);
    }
  }

  function onPointerUp(e) {
    if (!lightboxEl) return;
    if (e.pointerId !== activePointerId) return;

    const dt = Math.max(1, performance.now() - pStartTime);
    const vx = Math.abs(pDeltaX) / dt; // px/ms

    // reset pointer state
    activePointerId = null;
    swipeLocked = null;

    const shouldSwipe = (Math.abs(pDeltaX) > SWIPE_DIST) || (vx > SWIPE_VELOCITY);

    if (!shouldSwipe) {
      snapBack();
      return;
    }

    if (pDeltaX < 0) {
      // swipe left -> next
      snapOut(+1);
      nextImage();
    } else {
      // swipe right -> prev
      snapOut(-1);
      prevImage();
    }
  }

  // =====================
  // Image switching logic
  // =====================

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
    fadeSwitchTo(currentIndex);
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

    // Remove pointer listeners
    lightboxEl.removeEventListener('pointerdown', onPointerDown);
    lightboxEl.removeEventListener('pointermove', onPointerMove);
    lightboxEl.removeEventListener('pointerup', onPointerUp);
    lightboxEl.removeEventListener('pointercancel', onPointerUp);

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

    // Pointer swipe (better than touch)
    lightboxEl.addEventListener('pointerdown', onPointerDown);
    lightboxEl.addEventListener('pointermove', onPointerMove, { passive: false });
    lightboxEl.addEventListener('pointerup', onPointerUp);
    lightboxEl.addEventListener('pointercancel', onPointerUp);

    // JS-only open animation
    animateOpen(fullImg);
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
