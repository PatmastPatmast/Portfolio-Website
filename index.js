// =====================
// Lightbox (Fullscreen Images + Arrows + Keyboard + Pointer Swipe + Animations + Smart Preload)
// Thumbnail grid -> Full image via <a href="FULL.webp">
// =====================

(() => {
  // Collect thumbnails
  const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));
  if (lightboxImgs.length === 0) return; // nothing to do on this page

  let currentIndex = 0;
  let lightboxEl = null;
  let lightboxImgEl = null; // the <img> inside lightbox
  let prevBodyOverflow = '';
  let lastFocusedEl = null;

  // =====================
  // Helpers
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

  function preloadNeighbors() {
    // Only preload when lightbox is open
    if (!lightboxEl) return;
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
    const imgEl = lightboxImgEl;
    if (!imgEl) return;

    imgEl.style.transition = 'opacity 120ms ease';
    imgEl.style.opacity = '0';

    setTimeout(() => {
      imgEl.src = getFullSrc(index);
      imgEl.alt = lightboxImgs[index].alt || '';

      imgEl.style.transition = 'opacity 160ms ease';
      imgEl.style.opacity = '1';

      // Restore default transition after fade
      setTimeout(() => {
        if (!lightboxImgEl) return;
        lightboxImgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
        lightboxImgEl.style.transform = 'translateX(0) scale(1)';
      }, 180);
    }, 120);
  }

  // =====================
  // Pointer swipe (ONLY on image)
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
    if (!lightboxImgEl) return;
    lightboxImgEl.style.transition = 'none';
    lightboxImgEl.style.transform = `translateX(${x}px) scale(1)`;
  }

  function snapBack() {
    if (!lightboxImgEl) return;
    lightboxImgEl.style.transition = 'transform 160ms ease';
    lightboxImgEl.style.transform = 'translateX(0) scale(1)';
  }

  function snapOut(dir) {
    // dir: +1 (next) or -1 (prev)
    if (!lightboxImgEl) return;

    lightboxImgEl.style.transition = 'transform 140ms ease';
    lightboxImgEl.style.transform = `translateX(${dir * -80}px) scale(1)`;

    setTimeout(() => {
      if (!lightboxImgEl) return;
      lightboxImgEl.style.transition = 'transform 0ms linear';
      lightboxImgEl.style.transform = 'translateX(0) scale(1)';
    }, 140);
  }

  function onPointerDown(e) {
    if (!lightboxEl || !lightboxImgEl) return;
    if (activePointerId !== null) return;

    activePointerId = e.pointerId;
    // capture on the image element (not overlay)
    lightboxImgEl.setPointerCapture?.(activePointerId);

    pStartX = e.clientX;
    pStartY = e.clientY;
    pDeltaX = 0;
    pDeltaY = 0;
    pStartTime = performance.now();
    swipeLocked = null;
  }

  function onPointerMove(e) {
    if (!lightboxEl || !lightboxImgEl) return;
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
    if (!lightboxEl || !lightboxImgEl) return;
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
      snapOut(+1);
      nextImage();
    } else {
      snapOut(-1);
      prevImage();
    }
  }

  // =====================
  // Navigation logic
  // =====================

  function showImage(index) {
    currentIndex = (index + lightboxImgs.length) % lightboxImgs.length;
    fadeSwitchTo(currentIndex);
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
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      nextImage();
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      prevImage();
    }
  }

  // =====================
  // Open / Close
  // =====================

  function closeLightbox() {
    if (!lightboxEl) return;

    document.removeEventListener('keydown', onLightboxKeydown);

    // Remove pointer listeners from the image (safe)
    if (lightboxImgEl) {
      lightboxImgEl.removeEventListener('pointerdown', onPointerDown);
      lightboxImgEl.removeEventListener('pointermove', onPointerMove);
      lightboxImgEl.removeEventListener('pointerup', onPointerUp);
      lightboxImgEl.removeEventListener('pointercancel', onPointerUp);
    }

    lightboxEl.remove();
    lightboxEl = null;
    lightboxImgEl = null;

    document.body.style.overflow = prevBodyOverflow;

    // restore focus (nice UX)
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      try { lastFocusedEl.focus(); } catch {}
    }
    lastFocusedEl = null;
  }

  function openLightbox(index) {
    currentIndex = index;

    lastFocusedEl = document.activeElement;

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

    // Save reference to lightbox image
    lightboxImgEl = fullImg;

    // Lock scroll
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Ensure keyboard arrows always work (focus overlay)
    if (document.activeElement) {
      try { document.activeElement.blur(); } catch {}
    }
    lightboxEl.setAttribute('tabindex', '-1');
    try { lightboxEl.focus(); } catch {}

    // Click outside closes
    lightboxEl.addEventListener('click', closeLightbox);

    // Stop propagation (so clicks on image/buttons don't close)
    fullImg.addEventListener('click', (e) => e.stopPropagation());
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // Keyboard
    document.addEventListener('keydown', onLightboxKeydown);

    // Pointer swipe ONLY on image (prevents button click conflicts)
    fullImg.addEventListener('pointerdown', onPointerDown);
    fullImg.addEventListener('pointermove', onPointerMove, { passive: false });
    fullImg.addEventListener('pointerup', onPointerUp);
    fullImg.addEventListener('pointercancel', onPointerUp);

    // JS-only open animation
    animateOpen(fullImg);

    // Smart preload shortly after open
    setTimeout(preloadNeighbors, 150);
  }

  // =====================
  // Attach thumbnail listeners
  // =====================

  lightboxImgs.forEach((img, index) => {
    img.addEventListener('click', (e) => {
      const link = img.closest('a');
      if (link) e.preventDefault(); // prevent navigation to full image
      openLightbox(index);
    });
  });

// =====================
// My Work – Selected / PATMAST switch
// =====================
(() => {
  const btns = Array.from(
    document.querySelectorAll('.work-switch__btn[data-target]')
  );
  const panels = Array.from(
    document.querySelectorAll('.work-panel[data-panel]')
  );

  if (btns.length === 0 || panels.length === 0) return;

  function setPanel(key) {
    btns.forEach(b => {
      const active = b.dataset.target === key;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(p => {
      p.classList.toggle('is-active', p.dataset.panel === key);
    });

    try {
      localStorage.setItem('workTab', key);
    } catch {}
  }

  // Init
  let saved = null;
  try {
    saved = localStorage.getItem('workTab');
  } catch {}

  setPanel(saved || 'selected');

  btns.forEach(b =>
    b.addEventListener('click', () => setPanel(b.dataset.target))
  );
})();


