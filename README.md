# Portfolio — Curtis Nguyen-Wellmann

Personal portfolio website built as the graduation project for Developer Akademie's
Frontend Development course. Vanilla HTML/CSS/JavaScript (no framework, per course
requirements), fully bilingual (DE/EN), responsive from 320px to 5120px (49" ultrawide
monitors).

**Live site:** https://curtis-nguyen-wellmann.de

## Features
- Bilingual content (German/English) with instant language toggle, no page reload
- Fully responsive across phone, tablet, laptop, and ultrawide desktop breakpoints
- Contact form with server-side validation, honeypot spam protection, and real
  email delivery via PHP `mail()`
- Featured projects section linking to live demos and their own GitHub repos

## Tech stack
- HTML5, CSS3 (custom properties, `clamp()`/`calc()` for fluid responsive layout,
  no CSS framework)
- Vanilla JavaScript (no build step, no framework)
- PHP (contact form backend only)
- Hosted on All-Inkl shared hosting with Let's Encrypt SSL

## Project structure
```
├── index.html
├── contact.php          # Contact form backend
├── css/
│   ├── variable.css      # Design tokens (colors, spacing, fonts)
│   ├── reset.css
│   ├── style.css         # Base/desktop styles
│   └── responsive.css    # Breakpoint overrides (mobile/tablet/widescreen)
├── js/
│   ├── main.js            # All interactive behavior
│   └── translations.js    # DE/EN translation dictionary
├── legal/privacy/          # Legal notice + privacy policy pages
└── images/
```
