# Countdown 3D — Egyptian Preparatory Certificate Exams

**BY OMAR** · Built with [Claude](https://claude.ai) by Anthropic

A 3D countdown to the Egyptian Preparatory Certificate (3rd Preparatory) exams: giant seven-segment digits rendered with Three.js, a live countdown in Cairo time, and a camera flight driven by scroll. It is a pure static frontend (HTML, CSS, JavaScript) with no build step and no local dependencies.

The interface is in Arabic (RTL).

---

## Features

- **Real-time countdown** (days / hours / minutes / seconds) calculated from `Date.now()` in the **Africa/Cairo** timezone, with daylight-saving handled.
- **Real 3D scene**: seven-segment digits, a reflective floor, the exam date rendered as 3D digits, and a scroll-driven camera flight (native scrolling is never hijacked).
- **Responsive**: desktop, tablet and phone (a 2×2 grid on phones).
- **Adaptive quality**: the pixel ratio and effects scale down automatically on weak devices, and `prefers-reduced-motion` is respected.
- **Graceful fallback**: if WebGL or the Three.js library fails to load, the countdown keeps working without 3D.
- **Stability**: rendering pauses when the tab is hidden, recovers from WebGL context loss, and releases GPU resources when the page is closed.

## Project structure

```
.
├── index.html                    # Page markup and metadata
├── css/style.css                 # Styles
├── js/app.js                     # Countdown + Three.js scene (config at the top)
├── assets/
│   ├── favicon.svg
│   └── og-image.jpg              # Social preview image, 1200×630
├── 404.html
├── robots.txt
├── .nojekyll
├── .github/workflows/pages.yml   # Automatic deployment to GitHub Pages
├── LICENSE                       # MIT
└── README.md
```

## Run locally

Serve the folder with a local web server (do not just double-click `index.html`) so the fonts and the library load correctly:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or use `npx serve .`

## Deploy to GitHub Pages

**Recommended: GitHub Actions**

1. Create a new repository on GitHub (for example `countdown-3d`) and push the files:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Countdown 3D by Omar"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/countdown-3d.git
   git push -u origin main
   ```

2. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` deploys the site to `https://<USERNAME>.github.io/countdown-3d/`.

The workflow automatically replaces the `%SITE_URL%` placeholder in the canonical link and the social preview tags (Open Graph / Twitter) with the real site URL, and generates a `sitemap.xml`.

**Alternative: deploy from a branch**

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`. In this case, manually replace every `%SITE_URL%` in `index.html` with your site URL (for example `https://<USERNAME>.github.io/countdown-3d/`).

## Change the exam date

At the top of `js/app.js`:

```js
var EXAM={year:2027,month:1,day:16,hour:0,minute:0}; // Cairo local time
```

The countdown, the 3D date digits and the on-page date texts are all generated from this value. The static sentences that contain the date in `index.html` (the page description, `og:description`, `twitter:description` and the `noscript` message) should also be updated by hand.

## Technical notes

- Three.js is pinned to version `0.152.2` and loaded from jsDelivr with Subresource Integrity. If the integrity check fails it retries once without it; if the library cannot be loaded at all, the countdown still works without 3D.
- Fonts (Amiri and Germania One) are loaded from Google Fonts.
- No API keys, secrets or environment variables are used anywhere in the project.
- In the 3D view the days value is capped at 99 (the current exam date is below that).

## About this project

This project was designed and built by **Omar** together with **Claude**, an AI assistant made by Anthropic.

## License

MIT © 2026 Omar. See the `LICENSE` file.
