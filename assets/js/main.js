/* Minimal, framework-free JS
   Features:
   - Header year stamp
   - Site search (fetches blogpost headings)
   - Blogpost: build TOC (mobile + desktop), scrollspy, reading progress, reading-time
   - Smooth scrolling respects prefers-reduced-motion
*/

(function () {
  'use strict';

  // Stamp current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Site Search (index.html) =====
  const q = document.getElementById('site-search');
  const results = document.getElementById('search-results');

  async function buildSearchIndex() {
    // For now, fetch blogpost.html and extract H1/H2/H3
    try {
      const res = await fetch('/blogpost.html', { credentials: 'same-origin' });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const headings = [...doc.querySelectorAll('article h1, article h2, article h3')];
      return headings.map(h => ({
        page: 'Blogpost',
        text: h.textContent.trim(),
        id: h.id || '',
        url: 'blogpost.html' + (h.id ? '#' + h.id : '')
      }));
    } catch (e) {
      // fail silently without console errors
      return [];
    }
  }

  let searchIndex = null;
  if (q && results) {
    q.addEventListener('input', async (e) => {
      const term = e.target.value.trim().toLowerCase();
      if (!term) { results.style.display = 'none'; results.innerHTML = ''; return; }
      if (!searchIndex) searchIndex = await buildSearchIndex();
      const matches = searchIndex.filter(item => item.text.toLowerCase().includes(term) || item.page.toLowerCase().includes(term));
      results.innerHTML = matches.slice(0, 12).map(m => `<a role="option" href="${m.url}"><strong>${m.page}:</strong> ${m.text}</a>`).join('') || `<div class="small muted" style="padding:.5rem .6rem">No matches.</div>`;
      results.style.display = 'block';
    });
    // close dropdown on blur
    q.addEventListener('blur', () => setTimeout(() => { results.style.display = 'none'; }, 150));
  }

  // ===== Blogpost features =====
  const article = document.getElementById('post');
  if (article) {
    // Reading time
    const body = document.getElementById('article-body');
    const readingTimeEl = document.getElementById('reading-time');
    if (body && readingTimeEl) {
      const words = body.textContent.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.round(words / 200));
      readingTimeEl.textContent = `~${mins} min read`;
    }

    // Build ToC from H2/H3
    const headings = [...document.querySelectorAll('#article-body h2, #article-body h3')];
    const tocDesktop = document.getElementById('toc');
    const tocMobile = document.getElementById('toc-mobile');

    function slugify(text) {
      return text.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    headings.forEach(h => {
      if (!h.id) h.id = slugify(h.textContent);
    });

    function buildToc(container) {
      if (!container) return;
      let html = '';
      headings.forEach(h => {
        const depth = h.tagName === 'H3' ? 2 : 1;
        html += `<a class="toc-link depth-${depth}" href="#${h.id}">${h.textContent}</a>`;
      });
      container.innerHTML = html;
    }
    buildToc(tocDesktop);
    buildToc(tocMobile);

    // Scrollspy
    const links = [...document.querySelectorAll('.toc a, .toc-mobile nav a')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    );
    headings.forEach(h => observer.observe(h));

    // Smooth scroll with reduced-motion respect
    function prefersReduced() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', a.getAttribute('href'));
        target.focus({ preventScroll: true });
      }
    }, { passive: false });


    // Reading progress bar
    const progress = document.getElementById('reading-progress');
    if (progress) {
      const update = () => {
        const rect = body.getBoundingClientRect();
        const total = body.scrollHeight - window.innerHeight;
        const scrolled = Math.min(total, Math.max(0, window.scrollY - (body.offsetTop - 0)));
        const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
        progress.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', String(pct));
      };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }
})();
