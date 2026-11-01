// ===== Utilitaires =====
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// ===== Année dans le footer =====
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Thème clair / sombre =====
const themeToggle = $('#themeToggle');
const root = document.documentElement;

function getTheme() {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function setStoredTheme(theme) {
  try { localStorage.setItem('theme', theme); } catch (err) {}
}

function syncThemeButton() {
  if (!themeToggle) return;
  const isLight = getTheme() === 'light';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Passer au thème sombre' : 'Passer au thème clair');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    setStoredTheme(next);
    syncThemeButton();
  });
  syncThemeButton();
}

// ===== Menu mobile =====
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');

function closeMobileMenu() {
  if (!navLinks || !navToggle) return;
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  $$('a', navLinks).forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });
}

// ===== Effet machine à écrire dans le terminal =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const typedCode = $('#typedCode');

const terminalLines = [
  { text: "const dev = {" },
  { text: "  nom: 'Aurélien Fünffrock'," },
  { text: "  formation: 'BUT Informatique'," },
  { text: "  niveau: 'Année spéciale (BUT2)'," },
  { text: "  stack: ['C', 'Java', 'HTML/CSS'," },
  { text: "          'Linux', 'Shell', 'JavaScript']," },
  { text: "" },
  { text: "  // ce que je recherche" },
  { text: "  stage: {", highlight: true },
  { text: "    dispo: 'fin mai 2027',", highlight: true },
  { text: "    duree: '2 à 3 mois',", highlight: true },
  { text: "    domaine: 'Back-end / DevOps',", highlight: true },
  { text: "    focus: 'Linux / développement / un peu de sécurité'", highlight: true },
  { text: "  },", highlight: true },
  { text: "  alternance: {", highlight: true },
  { text: "    annee: '2027-2028',", highlight: true },
  { text: "    domaine: 'Back-end / DevOps',", highlight: true },
  { text: "    focus: '+ de sécurité si possible'", highlight: true },
  { text: "  },", highlight: true },
  { text: "  projet_actuel: 'Création de mon portfolio'," },
  { text: "  master: {", highlight: true },
  { text: "    domaine: 'Cybersécurité',", highlight: true },
  { text: "    rythme: 'Alternance (si admis)'", highlight: true },
  { text: "  }", highlight: true },
  { text: "};" }
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightLine(line) {
  if (line.trimStart().startsWith('//')) return `<span class="tk-comment">${escapeHtml(line)}</span>`;
  const re = /('[^']*'?)|\b(const)\b|([A-Za-zÀ-ÿ_$][\w$À-ÿ]*)(?=\s*:)/g;
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(line)) !== null) {
    out += escapeHtml(line.slice(last, match.index));
    if (match[1]) out += `<span class="tk-str">${escapeHtml(match[1])}</span>`;
    else if (match[2]) out += `<span class="tk-kw">${escapeHtml(match[2])}</span>`;
    else out += `<span class="tk-key">${escapeHtml(match[3])}</span>`;
    last = re.lastIndex;
  }
  return out + escapeHtml(line.slice(last));
}

function renderTerminal(lines, count) {
  let left = count;
  let html = '';
  lines.forEach((line, index) => {
    if (left < 0) return;
    const visible = line.text.slice(0, left);
    const typing = left <= line.text.length;
    const content = highlightLine(visible) + (typing ? '<span class="cursor">|</span>' : '');
    if (line.highlight) html += `<span class="tk-hl">${content}</span>`;
    else html += content + (!typing && index < lines.length - 1 ? '\n' : '');
    left -= line.text.length + 1;
  });
  return html;
}

function typeTerminal(lines, el, speed = 12) {
  if (!el) return;
  const total = lines.reduce((n, line) => n + line.text.length + 1, -1);
  el.innerHTML = renderTerminal(lines, total);
  if (el.parentElement) el.parentElement.style.minHeight = `${el.parentElement.offsetHeight}px`;
  if (reduceMotion) return;
  el.innerHTML = '';
  let i = 0;
  (function step() {
    el.innerHTML = renderTerminal(lines, i);
    i += 1;
    if (i <= total) window.setTimeout(step, speed);
  })();
}

typeTerminal(terminalLines, typedCode);

// ===== Barres de compétences =====
const skillFills = $$('.skill-fill');
if ('IntersectionObserver' in window && skillFills.length) {
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.style.width = `${target.dataset.fill || 0}%`;
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.4 });
  skillFills.forEach(fill => skillObserver.observe(fill));
} else {
  skillFills.forEach(fill => { fill.style.width = `${fill.dataset.fill || 0}%`; });
}

// ===== Formulaire de contact : préparation d'un mailto =====
const contactForm = $('#contactForm');
const formStatus = $('#formStatus');

function setFormState(state, message) {
  if (!contactForm || !formStatus) return;
  contactForm.classList.remove('is-error', 'is-success');
  if (state) contactForm.classList.add(state);
  formStatus.textContent = message;
}

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      setFormState('is-error', 'Merci de remplir correctement les champs nom, email et message.');
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !message) {
      setFormState('is-error', 'Merci d’indiquer votre nom et un message.');
      return;
    }

    const subject = `Contact portfolio — ${name}`;
    const body = [
      `Nom : ${name}`,
      `Email : ${email}`,
      '',
      message
    ].join('\n');

    const mailto = `mailto:afunffrock@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormState('is-success', 'Votre messagerie devrait s’ouvrir. Vérifiez le message, puis cliquez sur Envoyer dans votre application. Si rien ne s’ouvre, utilisez l’adresse email affichée à droite.');
    window.location.href = mailto;
  });
}
