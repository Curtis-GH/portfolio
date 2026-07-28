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
    // Rejects consecutive/leading/trailing dots in either the local or
    // domain part (e.g. "a..b@test.com" or "a@test..com"), which the
    // simpler pattern used to silently accept as valid.
    const emailPattern = /^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/;
    isValid = emailPattern.test(field.value.trim());
  } else if (field.name === 'name') {
    isValid = field.value.trim().length >= 2;
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
  const emailPattern = /^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/;

  return (
    name.value.trim().length >= 2 &&
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

  // Excludes the honeypot field (.hp-field input): it's not a real user
  // field and must stay empty, so the generic "non-empty" validation
  // below would otherwise wrongly flag it as invalid.
  const fields = form.querySelectorAll('.form-group input, .form-group textarea');
  const submitBtn = form.querySelector('.contact_submit');
  const feedback = form.querySelector('.contact_feedback');

  /**
   * Enables or disables the submit button based on overall form validity.
   *
   * @returns {void}
   */
  function refreshSubmitState() {
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');
    const privacy = form.querySelector('[name="privacy"]');
    const emailPattern = /^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/;

    const otherFieldsValid =
      name.value.trim().length >= 2 &&
      emailPattern.test(email.value.trim()) &&
      message.value.trim() !== '';

    if (otherFieldsValid) {
      const privacyGroup = privacy.closest('.form-group');
      const privacyError = privacyGroup ? privacyGroup.querySelector('.form-group_error') : null;
      if (privacyError) {
        privacyError.classList.toggle('is-visible', !privacy.checked);
      }
    }

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

    submitBtn.disabled = true;

    fetch('contact.php', {
      method: 'POST',
      body: new FormData(form),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          feedback.textContent = dict.feedback_success;
          feedback.className = 'contact_feedback is-success';
          form.reset();
        } else {
          feedback.textContent = dict.feedback_server_error;
          feedback.className = 'contact_feedback is-error';
        }
        setTimeout(() => {
          feedback.textContent = '';
          feedback.className = 'contact_feedback';
        }, 6000);
      })
      .catch(() => {
        feedback.textContent = dict.feedback_server_error;
        feedback.className = 'contact_feedback is-error';
        setTimeout(() => {
          feedback.textContent = '';
          feedback.className = 'contact_feedback';
        }, 6000);
      })
      .finally(() => {
        refreshSubmitState();
      });
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
 * Initializes tap-to-toggle behavior for the "Continually learning"
 * skill tooltip on touch screens, where :hover can't be relied on.
 * Tapping the icon toggles an "is-expanded" class that reveals the
 * tooltip the same way :hover does on desktop.
 *
 * @returns {void}
 */
function initSkillTooltipToggle() {
  const items = document.querySelectorAll('.skill-item--tooltip');
  const touchQuery = window.matchMedia('(max-width: 1150px)');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      if (!touchQuery.matches) return;
      item.classList.toggle('is-expanded');
    });
  });
}


/**
 * Sets a CSS custom property (--real-vw) to the real, accurate visible
 * viewport width (window.innerWidth), for use in calc() formulas
 * instead of the CSS unit 100vw.
 *
 * @returns {void}
 */
function initRealViewportWidth() {
  function update() {
    document.documentElement.style.setProperty('--real-vw', window.innerWidth + 'px');
  }
  update();
  window.addEventListener('resize', update);
}
/**
 * Sets CSS custom properties describing .about_photo-wrap's real
 * position relative to the true viewport edges:
 *  --photo-wrap-left  distance to the left edge (used by the ::before
 *                      fill — see style.css — to bleed all the way to
 *                      the true left edge, and by .about_wave's own
 *                      capped right-side stretch below)
 *  --photo-wrap-right-gap  distance from the photo-wrap's right edge to
 *                      the true right edge. .about_wave stretches into
 *                      part of this gap (capped, so it can't outgrow
 *                      the photo at extreme zoom — see style.css), and
 *                      the ::before fill covers whatever's left.
 * Neither distance is a fixed formula — both depend on how much space
 * the flexible about_text column takes up, which shifts with text
 * wrapping and viewport width.
 *
 * @returns {void}
 */
function initAboutWaveGeometry() {
  const photoWrap = document.querySelector('.about_photo-wrap');
  if (!photoWrap) return;
  function update() {
    const rect = photoWrap.getBoundingClientRect();
    document.documentElement.style.setProperty('--photo-wrap-left', rect.left + 'px');
    document.documentElement.style.setProperty('--photo-wrap-right-gap', (window.innerWidth - rect.right) + 'px');
  }
  update();
  window.addEventListener('resize', update);
  // Re-measure once the web font (Poppins) has actually finished loading —
  // it swaps in after the initial layout with a fallback font, which can
  // shift about_text's wrapping and therefore the photo's X position,
  // leaving the first measurement stale.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update);
  }
}

/**
 * Initializes the AOS (Animate On Scroll) library, if loaded.
 *
 * @returns {void}
 */
function initScrollAnimations() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 700,
    easing: 'ease-out',
    once: true,
    offset: 80,
  });
}

function init() {
  initLanguageToggle();
  initMobileMenu();
  initTestimonialCarousel();
  initContactForm();
  initProjectCardToggle();
  initSkillTooltipToggle();
  initRealViewportWidth();
  initAboutWaveGeometry();
  initScrollAnimations();
}

init();