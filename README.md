# uk-512.github.io

Personal portfolio of **Udayakrishna Duraisamy** — Cloud Engineer (GCP · AWS · DevOps · Cloud Security).

**Live site:** https://uk-512.github.io

## Stack

Plain HTML, CSS, and JavaScript — no frameworks, no build step. Deploys directly via GitHub Pages.

- `index.html` — single-page portfolio (about, skills, experience, projects, security, contact)
- `styles.css` — dark/light theming and seven switchable templates (Classic, Terminal, Swiss, Bento, Editorial, Blueprint, Print/CV) via CSS custom properties
- `script.js` — theme toggle, template dropdown, mobile nav, scroll reveal, and curated GitHub repo cards enriched live from the GitHub API

The Print/CV template doubles as a resume: switch to it and use the browser's Print → Save as PDF for a clean CV.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
