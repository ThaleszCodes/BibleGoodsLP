const dialog = document.querySelector('dialog');
document.querySelectorAll('.preview').forEach(button => button.addEventListener('click', () => {
  dialog.querySelector('img').src = button.dataset.image;
  dialog.showModal();
}));
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
const params = new URLSearchParams(location.search);
document.querySelectorAll('a.checkout').forEach(link => {
  const url = new URL(link.href);
  for (const [key, value] of params) {
    if (/^utm_(source|medium|campaign|content|term)$/.test(key) || ['fbclid', 'src', 'sck'].includes(key)) url.searchParams.set(key, value);
  }
  link.href = url.toString();
});
// Only prepare offscreen content. Already-visible content must never disappear.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const pending = new Set();
  const finish = el => {
    el.classList.remove('reveal-pending');
    pending.delete(el);
  };
  const entrances = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Rapid scrolling can move the target above the viewport before this callback.
      if (entry.boundingClientRect.bottom < 0) el.classList.add('reveal-instant');
      finish(el);
      entrances.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px 48px 0px' });
  const selector = '.chapter-mark, .section-heading, .gallery .preview, .faith-pause, .moment-grid article, .family-copy, .benefits article, .discovery-art, .discovery-copy, .conversation>div, .story-ribbon, .center-title, .steps article, .offer, .faq-heading, .questions details, .closing';
  document.querySelectorAll(selector).forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight + 48) return;
    pending.add(el);
    el.classList.add('reveal-ready', 'reveal-pending');
    entrances.observe(el);
  });
  const revealAll = () => {
    entrances.disconnect();
    pending.forEach(el => { el.classList.add('reveal-instant'); finish(el); });
  };
  motionPreference.addEventListener('change', event => { if (event.matches) revealAll(); });
  window.addEventListener('pageshow', event => { if (event.persisted) revealAll(); });
  document.addEventListener('focusin', event => {
    const el = event.target.closest('.reveal-pending');
    if (el) { el.classList.add('reveal-instant'); finish(el); entrances.unobserve(el); }
  });
}
const progress = document.querySelector('.scroll-progress span');
let progressFrame = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  progressFrame = false;
}
window.addEventListener('scroll', () => {
  if (!progressFrame) { progressFrame = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
