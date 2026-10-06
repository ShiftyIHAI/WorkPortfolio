'use strict';

// ─── SALT SHAKER SVG ───────────────────────────────────────────────────────
function saltShakerSVG(size = 36) {
  const h = Math.round(size * 1.28);
  return `<svg width="${size}" height="${h}" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="21" width="24" height="22" rx="5" fill="white"/>
    <path d="M6 32 Q6 21 11 21 H25 Q30 21 30 32" fill="white"/>
    <rect x="10" y="11" width="16" height="12" rx="3" fill="white"/>
    <rect x="8" y="5" width="20" height="8" rx="4" fill="white"/>
    <circle cx="13" cy="9" r="2" fill="#111"/>
    <circle cx="18" cy="9" r="2" fill="#111"/>
    <circle cx="23" cy="9" r="2" fill="#111"/>
    <rect x="1" y="3" width="3" height="3" rx="0.8" fill="white" opacity="0.75" transform="rotate(-20 1 3)"/>
    <rect x="32" y="1" width="2.5" height="2.5" rx="0.8" fill="white" opacity="0.6" transform="rotate(15 32 1)"/>
    <rect x="0" y="13" width="2" height="2" rx="0.5" fill="white" opacity="0.45" transform="rotate(-30 0 13)"/>
    <rect x="34" y="9" width="2" height="2" rx="0.5" fill="white" opacity="0.4" transform="rotate(25 34 9)"/>
  </svg>`;
}

// ─── STORAGE ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'urate_v2';
const VOTES_KEY   = 'urate_votes_v2';

function getGames() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveGames(g) { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)); }
function getVotes() {
  try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || {}; }
  catch { return {}; }
}
function saveVotes(v) { localStorage.setItem(VOTES_KEY, JSON.stringify(v)); }

// ─── ADMIN AUTH ────────────────────────────────────────────────────────────
const ADMIN_PW = 'admin';
function isAdmin() { return sessionStorage.getItem('urate_admin') === '1'; }

let _adminCb = null;
function requireAdmin(cb) {
  if (isAdmin()) { cb(); return; }
  _adminCb = cb;
  const overlay = document.getElementById('admin-modal');
  overlay.classList.remove('hidden');
  overlay.querySelector('#admin-pw').value = '';
  overlay.querySelector('#admin-err').style.display = 'none';
  setTimeout(() => overlay.querySelector('#admin-pw').focus(), 50);
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function avgRating(game) {
  if (!game.reviews?.length) return null;
  return game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length;
}
function fmtScore(n) {
  if (n === null) return '?';
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
}
function verdict(score) {
  if (score === null) return 'UNRATED';
  if (score >= 9.5) return 'MASTERPIECE';
  if (score >= 8.5) return 'AMAZING';
  if (score >= 7.0) return 'GREAT';
  if (score >= 5.5) return 'DECENT';
  if (score >= 4.0) return 'BAD';
  return 'AWFUL';
}
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}
function netVotes(r) { return (r.upvotes||0) - (r.downvotes||0); }

function scoreBadgeHTML(score, cls = 'score-badge') {
  if (score === null) return `<div class="${cls} unrated">TBD</div>`;
  return `<div class="${cls}">${fmtScore(score)}</div>`;
}

// ─── NAV ───────────────────────────────────────────────────────────────────
function logoHTML() {
  return `<a href="index.html" class="nav-logo">${saltShakerSVG(32)}<span class="nav-logo-text">URate</span></a>`;
}

function renderNav(page) {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  nav.innerHTML = `
    ${logoHTML()}
    <div class="nav-center">
      <div class="nav-search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" id="search-input" placeholder="Search games by title, developer, or genre…" autocomplete="off">
      </div>
    </div>
    </div>`;
}

// ─── GLOBAL MODALS ─────────────────────────────────────────────────────────
function createGlobalModals() {
  // Admin password modal
  const adminEl = document.createElement('div');
  adminEl.className = 'modal-overlay hidden';
  adminEl.id = 'admin-modal';
  adminEl.innerHTML = `<div class="modal" style="max-width:380px;">
    <div class="modal-header">
      <h2 class="modal-title">Admin Access</h2>
      <button class="modal-close" id="admin-close">&times;</button>
    </div>
    <div class="form-group">
      <label class="form-label">Password</label>
      <input class="form-input" id="admin-pw" type="password" placeholder="Enter admin password" autocomplete="off">
      <div id="admin-err" style="color:var(--down);font-size:12px;margin-top:6px;display:none;">Incorrect password.</div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" id="admin-cancel">Cancel</button>
      <button class="btn-primary" id="admin-submit">Confirm</button>
    </div>
  </div>`;
  document.body.appendChild(adminEl);

  const closeAdmin = () => { adminEl.classList.add('hidden'); _adminCb = null; };
  adminEl.querySelector('#admin-close').addEventListener('click', closeAdmin);
  adminEl.querySelector('#admin-cancel').addEventListener('click', closeAdmin);
  adminEl.addEventListener('click', e => { if (e.target === adminEl) closeAdmin(); });
  adminEl.querySelector('#admin-pw').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminEl.querySelector('#admin-submit').click();
  });
  adminEl.querySelector('#admin-submit').addEventListener('click', () => {
    if (adminEl.querySelector('#admin-pw').value === ADMIN_PW) {
      sessionStorage.setItem('urate_admin', '1');
      adminEl.classList.add('hidden');
      if (_adminCb) { const cb = _adminCb; _adminCb = null; cb(); }
    } else {
      adminEl.querySelector('#admin-err').style.display = 'block';
      adminEl.querySelector('#admin-pw').select();
    }
  });

  // Delete confirm modal
  const delEl = document.createElement('div');
  delEl.className = 'modal-overlay hidden';
  delEl.id = 'delete-modal';
  delEl.innerHTML = `<div class="modal" style="max-width:420px;">
    <div class="modal-header">
      <h2 class="modal-title">Delete Game</h2>
      <button class="modal-close" id="delete-close">&times;</button>
    </div>
    <p id="delete-msg" style="color:var(--text2);margin-bottom:8px;"></p>
    <p style="color:var(--text3);font-size:13px;">All reviews will be permanently removed.</p>
    <div class="modal-actions" style="margin-top:24px;">
      <button class="btn-cancel" id="delete-cancel">Cancel</button>
      <button class="btn-danger" id="delete-confirm">Delete Game</button>
    </div>
  </div>`;
  document.body.appendChild(delEl);

  const closeDelete = () => delEl.classList.add('hidden');
  delEl.querySelector('#delete-close').addEventListener('click', closeDelete);
  delEl.querySelector('#delete-cancel').addEventListener('click', closeDelete);
  delEl.addEventListener('click', e => { if (e.target === delEl) closeDelete(); });
}

function promptDelete(gameId, onDeleted) {
  const game = getGames().find(g => g.id === gameId);
  if (!game) return;
  const delEl = document.getElementById('delete-modal');
  delEl.querySelector('#delete-msg').innerHTML = `Are you sure you want to delete <strong>"${escHtml(game.title)}"</strong>?`;
  delEl.classList.remove('hidden');

  const old = delEl.querySelector('#delete-confirm');
  const btn = old.cloneNode(true);
  old.replaceWith(btn);
  btn.addEventListener('click', () => {
    saveGames(getGames().filter(g => g.id !== gameId));
    delEl.classList.add('hidden');
    onDeleted();
  });
}

// ─── GAME FORM (Add / Edit) ─────────────────────────────────────────────────
const PLATFORMS = ['PC','PS5','PS4','Xbox Series X','Xbox One','Nintendo Switch','Mobile'];
const GENRES    = ['Action','Action RPG','Action Adventure','RPG','FPS','Strategy','Simulation','Horror','Sports','Racing','Fighting','Platformer','Puzzle','Indie','MMO','Other'];

function openGameForm(existing, onSave) {
  const isEdit = existing !== null;
  const overlay = document.getElementById('game-form-modal');

  overlay.innerHTML = `<div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Edit Game' : 'Add a Game'}</h2>
      <button class="modal-close" id="gf-close">&times;</button>
    </div>

    <div class="form-group">
      <label class="form-label">Game Title</label>
      <input class="form-input" id="gf-title" type="text"
        value="${isEdit ? escHtml(existing.title) : ''}"
        placeholder="e.g. Elden Ring" autocomplete="off">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Developer</label>
        <input class="form-input" id="gf-dev" type="text"
          value="${isEdit ? escHtml(existing.developer||'') : ''}" placeholder="e.g. FromSoftware">
      </div>
      <div class="form-group">
        <label class="form-label">Publisher</label>
        <input class="form-input" id="gf-pub" type="text"
          value="${isEdit ? escHtml(existing.publisher||'') : ''}" placeholder="e.g. Bandai Namco">
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Genre</label>
        <select class="form-select" id="gf-genre">
          ${GENRES.map(g => `<option value="${g}" ${isEdit && existing.genre===g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Release Year</label>
        <input class="form-input" id="gf-year" type="number"
          value="${isEdit ? existing.year||'' : ''}"
          placeholder="${new Date().getFullYear()}" min="1970" max="2030">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Platforms</label>
      <div class="platform-checkboxes">
        ${PLATFORMS.map(p => {
          const checked = isEdit && (existing.platforms||[]).includes(p) ? 'checked' : '';
          return `<label class="platform-cb"><input type="checkbox" value="${p}" name="gf-platform" ${checked}> ${p}</label>`;
        }).join('')}
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn-cancel" id="gf-cancel">Cancel</button>
      <button class="btn-primary" id="gf-submit">${isEdit ? 'Save Changes' : 'Add Game'}</button>
    </div>
  </div>`;

  overlay.classList.remove('hidden');

  const close = () => overlay.classList.add('hidden');
  overlay.querySelector('#gf-close').addEventListener('click', close);
  overlay.querySelector('#gf-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#gf-submit').addEventListener('click', () => {
    const title = overlay.querySelector('#gf-title').value.trim();
    if (!title) { alert('Please enter a game title.'); return; }

    const platforms = [...overlay.querySelectorAll('input[name="gf-platform"]:checked')].map(el => el.value);

    close();
    onSave({
      title,
      developer: overlay.querySelector('#gf-dev').value.trim() || 'Unknown',
      publisher: overlay.querySelector('#gf-pub').value.trim() || '',
      genre:     overlay.querySelector('#gf-genre').value,
      year:      parseInt(overlay.querySelector('#gf-year').value) || new Date().getFullYear(),
      platforms: platforms.length ? platforms : ['PC'],
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
function initHomePage() {
  renderNav('home');
  createGlobalModals();

  const gfModal = document.createElement('div');
  gfModal.className = 'modal-overlay hidden';
  gfModal.id = 'game-form-modal';
  document.body.appendChild(gfModal);

  document.addEventListener('click', e => {
    if (e.target.closest('#open-add-game') || e.target.closest('#open-add-game-2')) {
      openGameForm(null, updates => {
        const games = getGames();
        games.push({ id: Date.now(), ...updates, reviews: [] });
        saveGames(games);
        renderHero();
        renderGamesGrid(getGames());
      });
    }

    const btn = e.target.closest('.card-admin-btn');
    if (btn) {
      e.stopPropagation();
      const gid    = parseInt(btn.dataset.gid);
      const action = btn.dataset.action;
      requireAdmin(() => {
        if (action === 'edit') {
          const game = getGames().find(g => g.id === gid);
          if (!game) return;
          openGameForm(game, updates => {
            const games = getGames();
            const idx   = games.findIndex(g => g.id === gid);
            if (idx >= 0) { games[idx] = { ...games[idx], ...updates }; saveGames(games); }
            renderHero();
            renderGamesGrid(getGames());
          });
        } else if (action === 'delete') {
          promptDelete(gid, () => { renderHero(); renderGamesGrid(getGames()); });
        }
      });
    }
  });

  document.getElementById('main-nav').addEventListener('input', e => {
    if (e.target.id === 'search-input') renderGamesGrid(getGames());
  });

  renderHero();
  renderGamesGrid(getGames());
}

function renderHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.innerHTML = `<div class="hero-text">
    <h1 class="hero-title">Rate the Games<br>You Love (or Hate)</h1>
    <p class="hero-desc" style="margin-top:14px;">Add any game, rate it out of 10, write your review, and let the community vote on the best takes.</p>
  </div>`;
}

function renderGamesGrid(allGames) {
  const grid = document.getElementById('games-grid');
  if (!grid) return;

  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  const games = q
    ? allGames.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.developer||'').toLowerCase().includes(q) ||
        (g.genre||'').toLowerCase().includes(q))
    : allGames;

  if (!games.length && q) {
    grid.innerHTML = `<div class="empty-state"><p>No games found for "${escHtml(q)}"</p></div>`;
    return;
  }
  if (!games.length) {
    grid.innerHTML = `<div class="empty-state"><p>No games yet — add one above!</p></div>`;
    return;
  }

  const sorted = [...games].sort((a, b) => (avgRating(b)??-1) - (avgRating(a)??-1));

  grid.innerHTML = sorted.map(g => {
    const score = avgRating(g);
    const platforms = (g.platforms||[]).slice(0, 4);
    const scoreVal  = score === null ? null : parseFloat(fmtScore(score));
    const scoreClass = scoreVal === null ? 'unrated'
      : scoreVal >= 8.5 ? 'score-great'
      : scoreVal >= 6.5 ? 'score-ok'
      : 'score-bad';

    return `
    <div class="game-card" onclick="window.location.href='game.html?id=${g.id}'">
      <div class="card-body">
        <div class="card-top-row">
          <div class="card-title">${escHtml(g.title)}</div>
          <div class="card-score-badge ${scoreClass}">${score === null ? 'TBD' : fmtScore(score)}</div>
        </div>
        <div class="card-sub">${escHtml(g.developer)} &nbsp;·&nbsp; ${g.year}</div>
        <div class="card-genre-row">
          <span class="card-genre-tag">${escHtml(g.genre)}</span>
          <span class="card-review-count">${g.reviews.length} review${g.reviews.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="card-platforms">
          ${platforms.map(p => `<span class="platform-tag">${escHtml(p)}</span>`).join('')}
          ${g.platforms.length > 4 ? `<span class="platform-tag">+${g.platforms.length - 4}</span>` : ''}
        </div>
        <div class="card-admin-btns">
          <button class="card-admin-btn" data-gid="${g.id}" data-action="edit" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="card-admin-btn danger" data-gid="${g.id}" data-action="delete" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// GAME PAGE
// ══════════════════════════════════════════════════════════════════════════════
function initGamePage() {
  renderNav('game');
  createGlobalModals();

  const gfModal = document.createElement('div');
  gfModal.className = 'modal-overlay hidden';
  gfModal.id = 'game-form-modal';
  document.body.appendChild(gfModal);

  document.getElementById('main-nav').addEventListener('keydown', e => {
    if (e.target.id === 'search-input' && e.key === 'Enter') {
      const q = e.target.value.trim();
      window.location.href = q ? `index.html?q=${encodeURIComponent(q)}` : 'index.html';
    }
  });

  const id   = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id)   { window.location.href = 'index.html'; return; }
  const game = getGames().find(g => g.id === id);
  if (!game) { window.location.href = 'index.html'; return; }

  renderGameHeader(game);
  renderWriteReview(game);

  let sort = 'best';
  renderReviews(id, sort);

  document.addEventListener('click', e => {
    const sb = e.target.closest('.sort-btn');
    if (sb) {
      sort = sb.dataset.sort;
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b === sb));
      renderReviews(id, sort);
    }

    if (e.target.closest('#edit-game-btn')) {
      requireAdmin(() => {
        const g = getGames().find(x => x.id === id);
        if (!g) return;
        openGameForm(g, updates => {
          const games = getGames();
          const idx   = games.findIndex(x => x.id === id);
          if (idx >= 0) { games[idx] = { ...games[idx], ...updates }; saveGames(games); }
          renderGameHeader(getGames().find(x => x.id === id) || g);
        });
      });
    }

    if (e.target.closest('#delete-game-btn')) {
      requireAdmin(() => promptDelete(id, () => { window.location.href = 'index.html'; }));
    }
  });
}

function renderGameHeader(game) {
  const el = document.getElementById('game-header');
  if (!el) return;
  const score = avgRating(game);

  el.innerHTML = `
    <div class="game-page-header">
      <div class="container">
        <button class="back-link" onclick="history.back()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>All Games
        </button>
        <h1 class="game-page-title">${escHtml(game.title)}</h1>
        <p class="game-page-dev">${escHtml(game.developer)}${game.year ? ` &nbsp;·&nbsp; ${game.year}` : ''}</p>
        <div class="game-page-platforms">
          ${(game.platforms||[]).map(p => `<span class="platform-tag">${escHtml(p)}</span>`).join('')}
        </div>
        <div class="game-score-row">
          ${scoreBadgeHTML(score, 'score-badge-xl')}
          <div class="game-score-meta">
            <div class="verdict-xl">${verdict(score)}</div>
            <div class="count-text">${game.reviews.length} user review${game.reviews.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ${score !== null ? `Avg ${fmtScore(score)}/10` : 'No reviews yet'}</div>
          </div>
        </div>
        <div class="game-admin-actions">
          <button class="btn-admin-edit" id="edit-game-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>Edit Game
          </button>
          <button class="btn-admin-delete" id="delete-game-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>Delete
          </button>
        </div>
      </div>
    </div>`;
}

function renderWriteReview(game) {
  const el = document.getElementById('write-review');
  if (!el) return;
  const savedName = localStorage.getItem('urate_username') || '';

  el.innerHTML = `
    <div class="write-review-box">
      <div class="write-review-title">Write a Review</div>
      <div class="form-group">
        <label class="form-label">Your Rating</label>
        <div class="rating-row">
          <input type="range" id="rv-rating" min="1" max="10" step="0.5" value="8">
          <div class="rating-number" id="rv-rating-display">8</div>
        </div>
        <div class="rating-label" id="rv-verdict-label">${verdict(8)}</div>
      </div>
      <div class="review-form-row">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="form-input" id="rv-author" type="text"
            placeholder="YourUsername" value="${escHtml(savedName)}" autocomplete="off">
        </div>
        <div></div>
      </div>
      <div class="form-group">
        <label class="form-label">Your Review</label>
        <textarea class="form-textarea" id="rv-text" placeholder="Share your thoughts…" rows="4"></textarea>
      </div>
      <button class="btn-primary" id="submit-review" style="max-width:180px;">Post Review</button>
    </div>`;

  const slider  = document.getElementById('rv-rating');
  const display = document.getElementById('rv-rating-display');
  const vlabel  = document.getElementById('rv-verdict-label');

  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    display.textContent = Number.isInteger(v) ? v : v.toFixed(1);
    vlabel.textContent  = verdict(v);
  });

  document.getElementById('submit-review').addEventListener('click', () => {
    const author = document.getElementById('rv-author').value.trim() || 'Anonymous';
    const text   = document.getElementById('rv-text').value.trim();
    const rating = parseFloat(slider.value);
    if (!text) { alert('Please write your review before posting.'); return; }

    localStorage.setItem('urate_username', author);
    const games = getGames();
    const g     = games.find(x => x.id === game.id);
    if (!g) return;

    g.reviews.push({
      id: Date.now(), author, rating, text,
      upvotes: 0, downvotes: 0,
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
    });

    saveGames(games);
    renderGameHeader(g);

    const sort = document.querySelector('.sort-btn.active')?.dataset.sort || 'best';
    renderReviews(g.id, sort);

    document.getElementById('rv-text').value = '';
    slider.value = 8; display.textContent = '8'; vlabel.textContent = verdict(8);
    document.getElementById('reviews-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderReviews(id, sort) {
  const el = document.getElementById('reviews-container');
  if (!el) return;
  const game = getGames().find(g => g.id === id);
  if (!game) return;

  const votes     = getVotes();
  const gameVotes = votes[id] || {};
  let   reviews   = [...(game.reviews || [])];

  if (sort === 'best')               reviews.sort((a,b) => netVotes(b) - netVotes(a));
  else if (sort === 'new')           reviews.sort((a,b) => b.id - a.id);
  else if (sort === 'top')           reviews.sort((a,b) => b.rating - a.rating);
  else if (sort === 'controversial') reviews.sort((a,b) =>
    ((b.upvotes||0)+(b.downvotes||0)) - ((a.upvotes||0)+(a.downvotes||0)));

  let distHTML = '';
  if (reviews.length) {
    const bins = Array(10).fill(0);
    reviews.forEach(r => { bins[Math.min(9, Math.max(0, Math.floor(r.rating)-1))]++; });
    const max = Math.max(...bins, 1);
    distHTML = `<div class="rating-dist">
      <div class="rating-dist-title">Rating Distribution</div>
      ${[10,9,8,7,6,5,4,3,2,1].map(n => {
        const count = bins[n-1], pct = Math.round((count/max)*100);
        return `<div class="rating-bar-row">
          <span class="rating-bar-label">${n}</span>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
          <span class="rating-bar-count">${count}</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  el.innerHTML = `
    <div class="reviews-header">
      <div class="reviews-count-title">${reviews.length} Review${reviews.length !== 1 ? 's' : ''}</div>
      <div class="sort-btns">
        <button class="sort-btn ${sort==='best'?'active':''}" data-sort="best">Best</button>
        <button class="sort-btn ${sort==='new'?'active':''}" data-sort="new">Newest</button>
        <button class="sort-btn ${sort==='top'?'active':''}" data-sort="top">Highest Rated</button>
        <button class="sort-btn ${sort==='controversial'?'active':''}" data-sort="controversial">Controversial</button>
      </div>
    </div>
    ${distHTML}
    ${reviews.length === 0
      ? `<div class="empty-state"><p>No reviews yet — be the first to rate this game!</p></div>`
      : reviews.map(r => reviewCardHTML(r, gameVotes[r.id])).join('')}`;

  el.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => handleVote(id, parseInt(btn.dataset.rid), btn.dataset.vote));
  });
}

function reviewCardHTML(r, myVote) {
  const net      = netVotes(r);
  const initial  = (r.author||'?')[0].toUpperCase();
  const netColor = net > 0 ? 'var(--up)' : net < 0 ? 'var(--down)' : 'inherit';
  return `
  <div class="review-card">
    <div class="vote-col">
      <button class="vote-btn ${myVote==='up'?'voted-up':''}" data-rid="${r.id}" data-vote="up" title="Upvote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${myVote==='up'?'currentColor':'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
      <span class="vote-score" style="color:${netColor}">${net > 0 ? '+'+net : net}</span>
      <button class="vote-btn ${myVote==='down'?'voted-down':''}" data-rid="${r.id}" data-vote="down" title="Downvote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${myVote==='down'?'currentColor':'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
    <div class="review-main">
      <div class="review-top">
        <div class="reviewer-info">
          <div class="reviewer-avatar">${escHtml(initial)}</div>
          <div>
            <div class="reviewer-name">${escHtml(r.author)}</div>
            <div class="reviewer-date">${escHtml(r.date)}</div>
          </div>
        </div>
        <div class="review-score-badge">${fmtScore(r.rating)}</div>
      </div>
      <p class="review-text">${escHtml(r.text)}</p>
    </div>
  </div>`;
}

function handleVote(gameId, reviewId, voteType) {
  const votes  = getVotes();
  const games  = getGames();
  const game   = games.find(g => g.id === gameId); if (!game) return;
  const review = game.reviews.find(r => r.id === reviewId); if (!review) return;

  if (!votes[gameId]) votes[gameId] = {};
  const current = votes[gameId][reviewId];

  if (current === 'up')   review.upvotes   = Math.max(0, (review.upvotes  ||0) - 1);
  if (current === 'down') review.downvotes = Math.max(0, (review.downvotes||0) - 1);

  if (current === voteType) {
    votes[gameId][reviewId] = null;
  } else {
    votes[gameId][reviewId] = voteType;
    if (voteType === 'up')   review.upvotes   = (review.upvotes  ||0) + 1;
    if (voteType === 'down') review.downvotes = (review.downvotes||0) + 1;
  }

  saveGames(games);
  saveVotes(votes);
  renderReviews(gameId, document.querySelector('.sort-btn.active')?.dataset.sort || 'best');
}

// ─── BOOT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('game.html')) initGamePage();
  else initHomePage();
});
