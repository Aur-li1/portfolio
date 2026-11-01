// Initialise le thème avant le rendu pour éviter un flash clair/sombre.
(() => {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) { /* stockage indisponible */ }
  const preferred = (saved === 'dark' || saved === 'light')
    ? saved
    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', preferred);
})();
