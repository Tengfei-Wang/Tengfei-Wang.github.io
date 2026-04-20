// ---------- Theme toggle ------------------------------------------------
(function initTheme() {
  const pref = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (pref === 'dark' || (!pref && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Blurred backdrop for thumbnails --------------------------
  // Injects --thumb-src CSS variable so the ::before pseudo-element can
  // render a blurred, scaled copy of the thumbnail as a background fill.
  document.querySelectorAll('.thumb').forEach(thumb => {
    const img = thumb.querySelector('img');
    if (img) {
      // Use the already-loaded src (or wait for it)
      const setSrc = () => thumb.style.setProperty('--thumb-src', `url('${img.src}')`);
      img.complete ? setSrc() : img.addEventListener('load', setSrc);
    }
  });

  // ---------- Theme toggle button --------------------------------------
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const updateIcon = () => {
      themeBtn.textContent = document.documentElement.classList.contains('dark') ? '☀' : '☾';
      themeBtn.setAttribute('aria-label',
        document.documentElement.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode');
    };
    updateIcon();
    themeBtn.addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      updateIcon();
    });
  }

  // ---------- Publication topic filter ---------------------------------
  const tabs = document.querySelectorAll('[data-topic-filter]');
  const cards = document.querySelectorAll('[data-topics]');
  const dividers = document.querySelectorAll('[data-year-divider]');

  function applyFilter(topic) {
    cards.forEach(c => {
      const topics = (c.dataset.topics || '').split(' ').filter(Boolean);
      c.style.display = (topic === 'all' || topics.includes(topic)) ? '' : 'none';
    });
    // Hide year dividers that have no visible cards underneath
    dividers.forEach(d => {
      let sib = d.nextElementSibling;
      let hasVisible = false;
      while (sib && !sib.hasAttribute('data-year-divider')) {
        if (sib.hasAttribute('data-topics') && sib.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        sib = sib.nextElementSibling;
      }
      d.style.display = hasVisible ? '' : 'none';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilter(tab.dataset.topicFilter);
    });
  });

  // ---------- News show-all toggle -------------------------------------
  const newsToggle = document.getElementById('news-toggle');
  if (newsToggle) {
    newsToggle.addEventListener('click', () => {
      const extras = document.querySelectorAll('.news-item.hidden-extra');
      const isHidden = extras[0]?.style.display !== 'list-item';
      extras.forEach(el => el.style.display = isHidden ? 'list-item' : 'none');
      newsToggle.textContent = isHidden ? 'Show fewer' : 'Show all news';
    });
  }

  // ---------- GitHub star counts for open-source cards ----------------
  // NOTE: Requires HTTPS (GitHub Pages). Will silently skip on file:// due to CORS.
  // Results cached in sessionStorage for the session.
  const fmtStars = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  async function fetchStars(repo) {
    const cacheKey = 'gh-stars:' + repo;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached !== null) return +cached;
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const { stargazers_count } = await res.json();
    sessionStorage.setItem(cacheKey, stargazers_count);
    return stargazers_count;
  }

  // Existing open-source section badges (data-repo on span)
  document.querySelectorAll('.github-stars[data-repo]').forEach(span => {
    const repo = span.dataset.repo;
    // Convert static span to an anchor badge
    const a = document.createElement('a');
    a.className = 'gh-star-btn';
    a.href = `https://github.com/${repo}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'Star on GitHub';
    a.innerHTML = `<span class="star-label"><svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg> Star</span><span class="star-count">…</span>`;
    span.replaceWith(a);
    fetchStars(repo)
      .then(n => { a.querySelector('.star-count').textContent = fmtStars(n); })
      .catch(err => {
        a.style.display = 'none';
        console.debug('[stars] ' + repo + ':', err.message);
      });
  });

  // Publication cards: find every pcard that has a GitHub "code" link,
  // inject a star badge right after that link, then fetch the count.
  document.querySelectorAll('.pcard').forEach(card => {
    // Skip if already has a star badge (open-source section cards handled above)
    if (card.querySelector('.github-stars')) return;
    const codeLink = Array.from(card.querySelectorAll('a.link-pill'))
      .find(a => a.hostname === 'github.com' && !a.href.includes('colab'));
    if (!codeLink) return;
    const parts = codeLink.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
    if (parts.length < 2) return;
    const repo = parts[0] + '/' + parts[1];
    const badge = document.createElement('a');
    const starSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;
    badge.className = 'gh-star-btn';
    badge.dataset.repo = repo;
    badge.href = `https://github.com/${repo}`;
    badge.target = '_blank';
    badge.rel = 'noopener';
    badge.innerHTML = `<span class="star-label"><svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg> Star</span><span class="star-count">…</span>`;
    badge.title = 'Star on GitHub';
    codeLink.insertAdjacentElement('afterend', badge);
    fetchStars(repo)
      .then(n => { badge.querySelector('.star-count').textContent = fmtStars(n); })
      .catch(err => {
        badge.style.display = 'none';
        console.debug('[stars] ' + repo + ':', err.message);
      });
  });

  // ---------- Scroll reveal ----------------------------------------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger pcard children within a section
        const delay = entry.target.classList.contains('pcard') ? 0 : 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Stagger pcards within each year group
  let cardIndex = 0;
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.classList.contains('pcard')) {
      el.style.animationDelay = `${(cardIndex % 6) * 60}ms`;
      cardIndex++;
    }
    revealObserver.observe(el);
  });
});
