# wcs240
# Content‑First Personal Site (Vanilla HTML/CSS/JS)

Production‑ready static site tailored for a university course. It ships a content‑first blogpost (multimodal analysis) + Home, with excellent accessibility, performance, and academic conventions. Perfect for GitHub Pages.

## One‑shot deployment (GitHub Pages)


1. **Create the repo**
   ```bash
   mkdir content-first-site && cd content-first-site
   # copy all provided files into this folder
   git init
   git add -A
   git commit -m "Initial commit: content-first personal site"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USER>/<YOUR-REPO>.git
   git push -u origin main
