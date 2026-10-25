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
const bar = document.querySelector('.mobile-bar');
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    bar.classList.toggle('visible', !entries[0].isIntersecting && hero.getBoundingClientRect().bottom < 0);
  }).observe(hero);
}
// Animate each visual group once; content stays available if animation fails or JS is disabled.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const entrances = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const order = Number(el.dataset.entranceOrder || 0);
      el.animate([
        { opacity: 0.15, transform: 'translateY(28px)', filter: 'blur(3px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }
      ], { duration: 760, delay: order * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'none' });
      entrances.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.hero-copy, .hero-art, .hero-action, .chapter-mark, .section-heading, .gallery .preview, .faith-pause, .moment-grid article, .family-copy, .benefits article, .discovery-art, .discovery-copy, .conversation>div, .story-ribbon, .center-title, .steps article, .offer, .optional, .faq-heading, .questions details, .closing').forEach(el => {
    const siblings = Array.from(el.parentElement.children);
    el.dataset.entranceOrder = String(Math.min(siblings.indexOf(el), 3));
    entrances.observe(el);
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
