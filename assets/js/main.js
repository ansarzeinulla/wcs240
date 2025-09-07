/* Minimal, framework-free JS
   (No change in features; safe for single-column view)
   - Year stamp
   - Blogpost: build ToC (mobile <details>), scrollspy, reading progress, reading-time
   - Smooth scrolling respects prefers-reduced-motion
*/

(function () {
  'use strict';
  
  // Aviation theme utilities
  const addFlightEffects = (progress) => {
    // Add visual flight effects based on scroll progress
    const progressValue = parseInt(progress.style.getPropertyValue('--progress')) || 0;
    
    if (progressValue > 10 && progressValue < 90) {
      progress.classList.add('flying');
    } else {
      progress.classList.remove('flying');
    }
    
    // Add milestone effects
    if (progressValue === 25 || progressValue === 50 || progressValue === 75) {
      progress.classList.add('milestone');
      setTimeout(() => progress.classList.remove('milestone'), 1000);
    }
  };

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Add aviation theme elements
  const addAviationElements = () => {
    // Add flight indicators when content loads
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      section.style.setProperty('--section-delay', (index * 0.1) + 's');
      section.classList.add('section-animate');
    });
  };
  
  // Initialize aviation theme
  document.addEventListener('DOMContentLoaded', addAviationElements);

  // Blogpost features
  const article = document.getElementById('post');
  if (article) {
    const body = document.getElementById('article-body');
    const readingTimeEl = document.getElementById('reading-time');
    if (body && readingTimeEl) {
      const words = body.textContent.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.round(words / 200));
      readingTimeEl.textContent = `~${mins} min read`;
    }

    // Build ToC from H2/H3
    const headings = [...document.querySelectorAll('#article-body h2, #article-body h3')];
    const tocMobile = document.getElementById('toc-mobile'); // desktop ToC removed/hidden

    function slugify(text) {
      return text.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    headings.forEach(h => { if (!h.id) h.id = slugify(h.textContent); });

    function buildToc(container) {
      if (!container) return;
      let html = '';
      headings.forEach(h => {
        const depth = h.tagName === 'H3' ? 2 : 1;
        html += `<a class="toc-link depth-${depth}" href="#${h.id}">${h.textContent}</a>`;
      });
      container.innerHTML = html;
    }
    buildToc(tocMobile);

    // Scrollspy for mobile ToC
    const links = [...document.querySelectorAll('.toc-mobile nav a')];
    if (links.length) {
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
    }

    // Smooth scroll (respects reduced motion)
    const prefersReduced = () =>
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Aviation-themed reading progress
    const progress = document.getElementById('reading-progress');
    if (progress && body) {
      const update = () => {
        const total = body.scrollHeight - window.innerHeight;
        const scrolled = Math.min(total, Math.max(0, window.scrollY - body.offsetTop));
        const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
        
        // Update CSS custom property for plane position
        progress.style.setProperty('--progress', pct + '%');
        progress.setAttribute('aria-valuenow', String(pct));
        
        // Add flight effects
        addFlightEffects(progress);
      };
      
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }
})();
