// =====================
// Lightbox (Fullscreen Images + Arrows + Touch Swipe + Animations)
// Thumbnail grid -> Full image via <a href="FULL.webp">
// =====================

// Collect thumbnails
const lightboxImgs = Array.from(document.querySelectorAll('.js-lightbox'));

// If no lightbox images on this page, do nothing
if (lightboxImgs.length > 0) {

  let currentIndex = 0;
  let lightboxEl = null;
  let prevBodyOverflow = '';

  // ---- Touch swipe state ----
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let isSwiping = false;

  const SWIPE_MIN_X = 50;        // min horizontal distance to count as swipe
  const SWIPE_MAX_Y = 60;        // if vertical movement too large, ignore
  const SWIPE_LOCK_RATIO = 1.2;  // horizontal must be clearly stronger than vertical

  function getLightboxImgEl() {
    return document.querySelector('.lightbox__img');
  }

  // ---- JS-only animation helpers ----
  function animateOpen(imgEl) {
    if (!imgEl) return;

    // Start state (before paint)
    imgEl.style.willChange = 'transform, opacity';
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.98)';

    // Next frame: animate to visible
    requestAnimationFrame(() => {
      imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    });
  }

  function resetSwipeTransform(imgEl) {
    if (!imgEl) return;

    imgEl.style.transition = 'transform 180ms ease';
    imgEl.style.transform = 'translateX(0) scale(1)';

    // Cleanup transition so it doesn't affect future changes
    setTimeout(() => {
      if (!imgEl) return;
      imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
    }, 180);
  }

  function onTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    deltaY = 0;
    isSwiping = false;

    // If user starts touching, remove any lingering swipe transition
    const imgEl = getLightboxImgEl();
    if (imgEl) {
      imgEl.style.transition = 'transform 0ms linear';
    }
  }

  function onTouchMove(e) {
    if (!e.touches || e.touches.length !== 1) return;

    const t = e.touches[0];
    deltaX = t.clientX - startX;
    deltaY = t.clientY - startY;

    // If gesture is mostly horizontal, treat as swipe and prevent page scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_LOCK_RATIO) {
      isSwiping = true;
      e.preventDefault(); // requires { passive: false }

      // Swipe follow animation (subtle)
      const imgEl = getLightboxImgEl();
      if (imgEl) {
        imgEl.style.transform = `translateX(${deltaX * 0.25}px) scale(0.98)`;
      }
    }
  }

  function onTouchEnd() {
    const imgEl = getLightboxImgEl();

    if (!isSwiping) {
      // restore transition if it was removed
      if (imgEl) imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
      return;
    }

    // If too vertical or too short -> just reset the transform
    if (Math.abs(deltaY) > SWIPE_MAX_Y || Math.abs(deltaX) < SWIPE_MIN_X) {
      resetSwipeTransform(imgEl);
      return;
    }

    // Trigger navigation
    if (deltaX < 0) {
      nextImage(); // swipe left -> next
    } else {
      prevImage(); // swipe right -> prev
    }

    // After switching, reset transform (new image should be centered)
    resetSwipeTransform(imgEl);
  }

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

    const imgEl = getLightboxImgEl();
    if (!imgEl) return;

    // Quick fade during switch (JS-only)
    imgEl.style.transition = 'opacity 120ms ease';
    imgEl.style.opacity = '0';

    setTimeout(() => {
      imgEl.src = getFullSrc(currentIndex);
      imgEl.alt = lightboxImgs[currentIndex].alt || '';

      // Fade back in
      imgEl.style.transition = 'opacity 160ms ease';
      imgEl.style.opacity = '1';

      // Restore standard transitions
      setTimeout(() => {
        imgEl.style.transition = 'transform 220ms ease, opacity 220ms ease';
      }, 180);
    }, 120);
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

    // Remove touch listeners
    lightboxEl.removeEventListener('touchstart', onTouchStart);
    lightboxEl.removeEventListener('touchmove', onTouchMove);
    lightboxEl.removeEventListener('touchend', onTouchEnd);

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

    // Touch swipe (important: touchmove must be passive:false to allow preventDefault)
    lightboxEl.addEventListener('touchstart', onTouchStart, { passive: true });
    lightboxEl.addEventListener('touchmove', onTouchMove, { passive: false });
    lightboxEl.addEventListener('touchend', onTouchEnd, { passive: true });

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
