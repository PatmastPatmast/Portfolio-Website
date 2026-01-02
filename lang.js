// =====================
// Essay language switch (mobile select + desktop buttons)
// =====================
(function () {
  const blocks = Array.from(document.querySelectorAll('.lang[data-lang]'));
  if (blocks.length === 0) return; // not an essay page

  const buttons = Array.from(document.querySelectorAll('.langbtn[data-lang]'));
  const select = document.getElementById('langSelect');

  // Which languages exist on this page?
  const available = new Set(blocks.map(b => b.dataset.lang));

  // Remove languages that don't exist (safe for reuse)
  if (select) {
    Array.from(select.options).forEach(opt => {
      if (!available.has(opt.value)) opt.remove();
    });
  }

  buttons.forEach(btn => {
    if (!available.has(btn.dataset.lang)) btn.remove();
  });

  function setLang(lang) {
    if (!available.has(lang)) lang = blocks[0]?.dataset.lang || 'de';

    blocks.forEach(b =>
      b.classList.toggle('lang--active', b.dataset.lang === lang)
    );

    buttons.forEach(btn =>
      btn.classList.toggle('is-active', btn.dataset.lang === lang)
    );

    if (select) select.value = lang;

    // remember choice
    try {
      localStorage.setItem('essayLang', lang);
    } catch {}
  }

  // initial language
  let saved = null;
  try {
    saved = localStorage.getItem('essayLang');
  } catch {}

  const initial =
    (saved && available.has(saved))
      ? saved
      : (blocks[0]?.dataset.lang || 'de');

  setLang(initial);

  // events
  buttons.forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  if (select) {
    select.addEventListener('change', () => setLang(select.value));
  }
})();
