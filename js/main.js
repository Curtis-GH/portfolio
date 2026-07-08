/**
 * Initializes the language toggle buttons in the header.
 * Clicking a button marks it active and removes the active state from its sibling.
 * Does not yet translate content — that logic follows in a later phase.
 *
 * @returns {void}
 */
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('lang-btn--active'));
      button.classList.add('lang-btn--active');
    });
  });
}

/**
 * Main entry point for the portfolio site.
 * Further logic (form validation, etc.) will be added in later phases.
 *
 * @returns {void}
 */
function init() {
  initLanguageToggle();
}

init();

/**
 * Initializes the language toggle buttons in the header.
 * Clicking a button marks it active and removes the active state from its sibling.
 * Does not yet translate content — that logic follows in a later phase.
 *
 * @returns {void}
 */
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('lang-btn--active'));
      button.classList.add('lang-btn--active');
    });
  });
}

/**
 * Initializes the testimonial carousel in the References section.
 * Supports navigation via prev/next arrows and clickable dots.
 * Only one slide is visible at a time, toggled via the "is-active" class.
 *
 * @returns {void}
 */
function initTestimonialCarousel() {
  const slides = document.querySelectorAll('.testimonial__slide');
  const dots = document.querySelectorAll('.testimonial__dot');
  const arrows = document.querySelectorAll('.testimonial__arrow');
  const avatar = document.querySelector('.testimonial__avatar');

  if (slides.length === 0) return;

  let currentIndex = 0;

  /**
   * Shows the slide at the given index, updates dot states and avatar initials.
   *
   * @param {number} index - Index of the slide to show.
   * @returns {void}
   */
  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('is-active'));
    dots.forEach((dot) => dot.classList.remove('is-active'));

    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
    if (avatar) {
      avatar.textContent = slides[index].dataset.initials || '';
    }
    currentIndex = index;
  }

  showSlide(0);

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      const direction = arrow.dataset.dir === 'next' ? 1 : -1;
      const nextIndex = (currentIndex + direction + slides.length) % slides.length;
      showSlide(nextIndex);
    });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });
}

/**
 * Main entry point for the portfolio site.
 * Further logic (form validation, etc.) will be added in later phases.
 *
 * @returns {void}
 */
function init() {
  initLanguageToggle();
  initTestimonialCarousel();
}

init();