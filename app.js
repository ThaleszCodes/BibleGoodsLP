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

// Animate native details in both directions; repeated clicks reverse from the current height.
document.querySelectorAll('details').forEach(details => {
  const summary = details.querySelector('summary');
  let animation = null;
  let expanded = details.open;
  summary.addEventListener('click', event => {
    event.preventDefault();
    expanded = !expanded;
    summary.setAttribute('aria-expanded', String(expanded));
    if (motionPreference.matches || typeof details.animate !== 'function') {
      if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
      details.open = expanded;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
      return;
    }
    const from = details.getBoundingClientRect().height;
    if (animation) { animation.onfinish = null; animation.cancel(); }
    // Measure natural open and closed heights synchronously, before the browser paints.
    details.style.height = 'auto';
    details.open = expanded;
    const to = details.getBoundingClientRect().height;
    details.open = true;
    details.style.height = from + 'px';
    details.style.overflow = 'hidden';
    animation = details.animate({height: [from + 'px', to + 'px']}, {
      duration: 300, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'forwards'
    });
    animation.onfinish = () => {
      details.open = expanded;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
      animation.cancel();
      animation = null;
      updateProgress();
    };
  });
});

// Meta tracking: an offer view and a checkout click are not confirmed purchases.
(() => {
  const offer = document.querySelector('#oferta');
  let viewed = false;
  const trackView = () => {
    if (viewed || typeof window.fbq !== 'function') return;
    viewed = true;
    window.fbq('track', 'ViewContent', {
      content_ids: ['biblia_goods_30_livros'],
      content_type: 'product', value: 10, currency: 'BRL'
    });
  };
  if (offer && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        trackView();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(offer);
  }
  document.querySelectorAll('a[href^="https://pay.cakto.com.br/"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.fbq !== 'function') return;
      window.fbq('trackCustom', 'CheckoutClick', {
        value: 10, currency: 'BRL', button_location:
          link.closest('.hero') ? 'hero' :
          link.closest('#oferta') ? 'offer' :
          link.closest('.closing') ? 'closing' : 'footer'
      });
    });
  });
})();
