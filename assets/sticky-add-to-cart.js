(() => {
  const productInfo = document.querySelector('product-info');
  const primaryButton = productInfo?.querySelector('.product-form__submit');
  const form = productInfo?.querySelector('form[data-type="add-to-cart-form"]');
  if (!productInfo || !primaryButton || !form) return;

  const sticky = document.createElement('div');
  sticky.className = 'sticky-add-to-cart';
  sticky.setAttribute('aria-label', 'Quick add to cart');
  sticky.innerHTML = `
    <span class="sticky-add-to-cart__price"></span>
    <button class="sticky-add-to-cart__button button button--primary" type="submit">
      <span>${primaryButton.querySelector('span')?.textContent.trim() || 'Add to cart'}</span>
    </button>
  `;
  document.body.appendChild(sticky);
  const stickyButton = sticky.querySelector('button');
  const price = sticky.querySelector('.sticky-add-to-cart__price');

  stickyButton.addEventListener('click', () => form.requestSubmit());
  const update = () => {
    stickyButton.disabled = primaryButton.disabled;
    stickyButton.querySelector('span').textContent = primaryButton.querySelector('span')?.textContent.trim() || '';
    const currentPrice = productInfo.querySelector('.price--large');
    if (currentPrice) price.innerHTML = currentPrice.innerHTML;
  };
  update();

  new IntersectionObserver(([entry]) => {
    sticky.classList.toggle('is-visible', !entry.isIntersecting);
  }, { threshold: 0 }).observe(primaryButton);

  document.body.addEventListener('variant-change', update);
})();
