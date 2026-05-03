async function loadPartial(selector, path) {
  const target = document.querySelector(selector);
  if (!target) return;

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${path}`);
  }

  target.innerHTML = await response.text();
}

function markActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('[data-nav]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setupMenuToggle() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        nav.classList.remove('open');
      }
    });
  });
}

function applyTranslations(currentLang, translations) {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  document.querySelectorAll('.lang-switch a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-lang') === currentLang);
  });
}

async function initGlobalLayout(translations, onLanguageChange) {
  await loadPartial('#site-header', '/partials/header.html');
  await loadPartial('#site-footer', '/partials/footer.html');

  markActiveNav();
  setupMenuToggle();

  let currentLang = localStorage.getItem('siteLang') || 'en';
  applyTranslations(currentLang, translations);

  document.querySelectorAll('.lang-switch a').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      currentLang = link.getAttribute('data-lang');
      localStorage.setItem('siteLang', currentLang);
      applyTranslations(currentLang, translations);

      if (typeof onLanguageChange === 'function') {
        await onLanguageChange(currentLang);
      }
    });
  });

  return currentLang;
}