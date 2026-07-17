/**
 * Applies the given language's translations to every element with a
 * [data-i18n] attribute, every input with [data-i18n-placeholder], and
 * remembers the choice in localStorage.
 *
 * @param {string} lang - Language code, "en" or "de".
 * @returns {void}
 */
function applyLanguage(lang) {
  const dict = translations[lang] || translations.en;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
}

/**
 * Initializes the language toggle buttons in the header. Clicking a button
 * marks it active, removes the active state from its sibling, and applies
 * that button's language (read from its data-lang attribute). Restores the
 * last chosen language from localStorage on page load, if any.
 *
 * @returns {void}
 */
function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;
      buttons.forEach((btn) => {
        btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
      });
      applyLanguage(lang);
    });
  });

  const savedLang = localStorage.getItem('lang');
  const activeBtn = document.querySelector('.lang-btn--active');
  const initialLang = savedLang || activeBtn?.dataset.lang || 'en';

  buttons.forEach((btn) => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === initialLang);
  });
  applyLanguage(initialLang);
}
/**
 * Initializes the mobile hamburger menu: toggles the fullscreen overlay
 * open/closed and closes it again when a nav link inside is clicked.
 *
 * @returns {void}
 */
function initMobileMenu() {
  const burger = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
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
  const slides = document.querySelectorAll('.testimonial_slide');
  const dots = document.querySelectorAll('.testimonial_dot');
  const arrows = document.querySelectorAll('.testimonial_arrow');
  const avatar = document.querySelector('.testimonial_avatar');

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
 * Validates a single form field and toggles its error message.
 * Uses a real email pattern check for the email field.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to validate.
 * @returns {boolean} True if the field is valid.
 */
function validateField(field) {
  const group = field.closest('.form-group');
  const error = group ? group.querySelector('.form-group_error') : null;
  let isValid = true;

  if (field.type === 'checkbox') {
    isValid = field.checked;
  } else if (field.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailPattern.test(field.value.trim());
  } else {
    isValid = field.value.trim() !== '';
  }

  if (error) {
    error.classList.toggle('is-visible', !isValid);
  }
  field.classList.toggle('is-invalid', !isValid);

  return isValid;
}

/**
 * Checks whether all required fields of the contact form are valid,
 * without showing error messages (used to toggle the submit button).
 *
 * @param {HTMLFormElement} form - The contact form.
 * @returns {boolean} True if every required field is valid.
 */
function isFormValid(form) {
  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const message = form.querySelector('[name="message"]');
  const privacy = form.querySelector('[name="privacy"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    name.value.trim() !== '' &&
    emailPattern.test(email.value.trim()) &&
    message.value.trim() !== '' &&
    privacy.checked
  );
}

/**
 * Initializes the contact form: onBlur validation, submit-button toggle,
 * and success/error feedback after submit. Validation runs on blur, not on input,
 * so it does not interrupt typing (US7).
 *
 * @returns {void}
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = form.querySelectorAll('input, textarea');
  const submitBtn = form.querySelector('.contact_submit');
  const feedback = form.querySelector('.contact_feedback');

  /**
   * Enables or disables the submit button based on overall form validity.
   *
   * @returns {void}
   */
  function refreshSubmitState() {
    submitBtn.disabled = !isFormValid(form);
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      validateField(field);
      refreshSubmitState();
    });
    field.addEventListener('change', () => {
      validateField(field);
      refreshSubmitState();
    });
    field.addEventListener('input', refreshSubmitState);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const lang = document.documentElement.lang || 'en';
    const dict = translations[lang] || translations.en;

    let allValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      feedback.textContent = dict.feedback_error;
      feedback.className = 'contact_feedback is-error';
      return;
    }

    feedback.textContent = dict.feedback_success;
    feedback.className = 'contact_feedback is-success';
    form.reset();
    refreshSubmitState();
  });
}

/**
 * Initializes tap-to-toggle behavior for project cards on touch screens
 * (Mobile ≤768px + Tablet 769–1150px), where the reveal can't rely on CSS
 * :hover (touch devices "stick" a hover state instead of toggling it).
 * Tapping anywhere on the card except the Github/Live-test links toggles
 * an "is-expanded" class, which mirrors the desktop hover overlay look
 * (style.css) across the whole ≤1150px range. Only active while the
 * ≤1150px media query matches, so desktop (mouse) hover above that is
 * untouched.
 *
 * @returns {void}
 */
function initProjectCardToggle() {
  const cards = document.querySelectorAll('.project-card');
  const touchQuery = window.matchMedia('(max-width: 1150px)');

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (!touchQuery.matches) return;
      if (event.target.closest('.project-card_links')) return;

      const isExpanded = card.classList.toggle('is-expanded');
      card.setAttribute('aria-expanded', String(isExpanded));
    });
  });
}

/**
 * Main entry point for the portfolio site.
 * Further logic will be added in later phases.
 *
 * @returns {void}
 */
function init() {
  initLanguageToggle();
  initMobileMenu();
  initTestimonialCarousel();
  initContactForm();
  initProjectCardToggle();
}

init();