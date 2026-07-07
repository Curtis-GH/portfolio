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