// =====================
// Navigation
// =====================

const navToggle = document.querySelector('.navToggle');
const navLinks = document.querySelectorAll('.nav__link');

navToggle.addEventListener("click", () => {
    document.body.classList.toggle('nav-open');
});

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        document.body.classList.remove('nav-open');
    });
});


// =====================
// Lightbox (Fullscreen Images)
// =====================

document.querySelectorAll('.js-lightbox').forEach(img => {
    img.addEventListener('click', (e) => {

        // Prevent navigation if image is wrapped in a link
        const link = img.closest('a');
        if (link) e.preventDefault();

        // Create overlay
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox is-open';

        // Create image
        const fullImg = document.createElement('img');
        fullImg.src = img.src;
        fullImg.alt = img.alt || '';

        lightbox.appendChild(fullImg);
        document.body.appendChild(lightbox);

        // Close on click
        const closeLightbox = () => {
            lightbox.remove();
        };

        lightbox.addEventListener('click', closeLightbox);

        // Close on ESC
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') {
                closeLightbox();
            }
        }, { once: true });
    });
});
