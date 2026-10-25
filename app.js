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
