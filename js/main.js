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
 * Validates a single form field and toggles its error message.
 * Uses a real email pattern check for the email field.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to validate.
 * @returns {boolean} True if the field is valid.
 */
function validateField(field) {
  const group = field.closest('.form-group');
  const error = group ? group.querySelector('.form-group__error') : null;
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
  const submitBtn = form.querySelector('.contact__submit');
  const feedback = form.querySelector('.contact__feedback');

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
    field.addEventListener('change', refreshSubmitState);
    field.addEventListener('input', refreshSubmitState);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let allValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      feedback.textContent = 'Please fix the highlighted fields.';
      feedback.className = 'contact__feedback is-error';
      return;
    }

    feedback.textContent = 'Thanks! Your message has been sent.';
    feedback.className = 'contact__feedback is-success';
    form.reset();
    refreshSubmitState();
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
  initTestimonialCarousel();
  initContactForm();
}

init();