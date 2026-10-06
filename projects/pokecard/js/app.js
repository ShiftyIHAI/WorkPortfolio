'use strict';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const SAVE_KEY        = 'pokepack_lost_origin';
const PASSIVE_PER_HR  = 50;   // tokens/hour
const STARTING_TOKENS = 500;

const PRODUCTS = [
  {
    id: 'single-pack',
    name: 'Booster Pack',
    desc: '10 cards — 1 pack',
    detail: 'Lost Origin · 1 pack',
    packs: 1,
    price: 50,
    market: '$5.00',
  },
  {
    id: 'blister',
    name: '3-Pack Blister',
    desc: '30 cards — 3 packs',
    detail: 'Lost Origin · 3 packs + coin',
    packs: 3,
    price: 135,
    market: '$13.50',
  },
  {
    id: 'etb',
    name: 'Elite Trainer Box',
    desc: '80 cards — 8 packs',
    detail: 'Lost Origin · 8 packs + sleeves + die',
    packs: 8,
    price: 450,
    market: '$45.00',
  },
  {
    id: 'booster-box',
    name: 'Booster Box',
    desc: '360 cards — 36 packs',
    detail: 'Lost Origin · 36 packs · factory sealed',
    packs: 36,
    price: 1300,
    market: '$130.00',
  },
];

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
let state = loadState();

function defaultState() {
  return {
    tokens: STARTING_TOKENS,
    lastTick: Date.now(),
    inventory: {},   // { productId: qty }
    collection: {},  // { cardId: qty }
    stats: {
      packsOpened: 0,
      tokensEarned: STARTING_TOKENS,
      tokensSpent: 0,
      pullsByRarity: {},
      bestPull: null,
    },
    firstVisit: true,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    // Apply passive income earned offline
    const elapsed = (Date.now() - (s.lastTick || Date.now())) / 3_600_000;
    const earned  = Math.floor(elapsed * PASSIVE_PER_HR);
    if (earned > 0) {
      s.tokens += earned;
      s.stats.tokensEarned = (s.stats.tokensEarned || 0) + earned;
    }
    s.lastTick = Date.now();
    return s;
  } catch { return defaultState(); }
}

function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }

// ═══════════════════════════════════════════════════════════
// PASSIVE INCOME TICKER
// ═══════════════════════════════════════════════════════════
function startTicker() {
  setInterval(() => {
    const gain = PASSIVE_PER_HR / 60;
    state.tokens           += gain;
    state.stats.tokensEarned = (state.stats.tokensEarned || 0) + gain;
    state.lastTick          = Date.now();
    refreshTokenDisplay();
    save();
  }, 60_000);
}

// ═══════════════════════════════════════════════════════════
// TOKEN DISPLAY
// ═══════════════════════════════════════════════════════════
function refreshTokenDisplay() {
  document.getElementById('token-count').textContent =
    Math.floor(state.tokens).toLocaleString();
}

// ═══════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════
let activeTab = 'shop';

function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.nav-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-pane').forEach(p =>
    p.classList.toggle('active', p.id === `tab-${tab}`));

  if (tab === 'shop')       renderShop();
  if (tab === 'inventory')  renderInventory();
  if (tab === 'collection') renderCollection();
  if (tab === 'stats')      renderStats();
}

function updateInventoryBadge() {
  const total = Object.values(state.inventory).reduce((a, b) => a + b, 0);
  const badge = document.getElementById('inventory-badge');
  if (total > 0) {
    badge.textContent = total;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════════════════════
// SHOP
// ═══════════════════════════════════════════════════════════
function renderShop() {
  const grid = document.getElementById('shop-grid');
  grid.innerHTML = PRODUCTS.map(p => {
    const canBuy = state.tokens >= p.price;
    const perPack = (p.price / p.packs).toFixed(1);
    return `
      <article class="product-card product-${p.id}">
        <div class="product-art art-${p.id}">
          <div class="art-glow"></div>
          <div class="art-label">
            <span class="art-setname">LOST ORIGIN</span>
            <span class="art-packname">${p.name.toUpperCase()}</span>
          </div>
          <div class="art-symbol">⟡</div>
        </div>
        <div class="product-body">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.detail}</p>
          <div class="product-meta">
            <span class="product-market">Market ${p.market}</span>
            <span class="product-per">≈ ${perPack}T/pack</span>
          </div>
          <div class="product-buy-row">
            <span class="product-price">
              <span class="t-coin">T</span>${p.price.toLocaleString()}
            </span>
            <button class="btn-buy${canBuy ? '' : ' btn-disabled'}"
              data-pid="${p.id}" ${canBuy ? '' : 'disabled'}>
              ${canBuy ? 'Buy' : 'Need Tokens'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.btn-buy:not(.btn-disabled)').forEach(btn =>
    btn.addEventListener('click', () => buyProduct(btn.dataset.pid)));
}

function buyProduct(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p || state.tokens < p.price) return;
  state.tokens        -= p.price;
  state.stats.tokensSpent = (state.stats.tokensSpent || 0) + p.price;
  state.inventory[pid] = (state.inventory[pid] || 0) + 1;
  save();
  refreshTokenDisplay();
  renderShop();
  updateInventoryBadge();
  toast(`Purchased ${p.name}!`, 'success');
  switchTab('inventory');
}

// ═══════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════
function renderInventory() {
  const list = document.getElementById('inventory-list');
  const msg  = document.getElementById('no-packs-msg');
  const items = Object.entries(state.inventory).filter(([, q]) => q > 0);

  if (!items.length) {
    msg.classList.remove('hidden');
    list.innerHTML = '';
    return;
  }
  msg.classList.add('hidden');

  list.innerHTML = items.map(([pid, qty]) => {
    const p = PRODUCTS.find(x => x.id === pid);
    if (!p) return '';
    return `
      <div class="inv-item">
        <div class="inv-art art-${pid}">
          <div class="art-symbol small">⟡</div>
        </div>
        <div class="inv-body">
          <h3>${p.name}</h3>
          <p class="inv-qty">×${qty} in inventory · ${p.packs} pack${p.packs > 1 ? 's' : ''} each</p>
        </div>
        <button class="btn-open btn-primary" data-pid="${pid}">
          Open ${p.packs > 1 ? p.packs + ' Packs' : 'Pack'}
        </button>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.btn-open').forEach(btn =>
    btn.addEventListener('click', () => startOpening(btn.dataset.pid)));
}

// ═══════════════════════════════════════════════════════════
// PACK OPENING ENGINE
// ═══════════════════════════════════════════════════════════
let opening = null;   // current opening session

function startOpening(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p || !state.inventory[pid]) return;

  // Consume one unit from inventory
  state.inventory[pid]--;
  if (!state.inventory[pid]) delete state.inventory[pid];
  state.stats.packsOpened = (state.stats.packsOpened || 0) + p.packs;
  save();
  updateInventoryBadge();

  // Build pack queue
  const packs = [];
  for (let i = 0; i < p.packs; i++) packs.push(generatePack());

  opening = {
    product: p,
    packs,
    packIdx: 0,          // current pack index (0-based)
    cardIdx: 0,          // current card index within pack (0-based)
    revealed: [],        // cards revealed in current pack
    allRevealed: [],     // every card revealed this session
    animating: false,
  };

  showOverlay();
  loadPack();
}

function showOverlay() {
  document.getElementById('opening-overlay').classList.remove('hidden');
}

function hideOverlay() {
  document.getElementById('opening-overlay').classList.add('hidden');
}

function loadPack() {
  const { packs, packIdx, product } = opening;
  opening.revealed = [];
  opening.cardIdx  = 0;

  // Header
  document.getElementById('opening-title').textContent =
    product.packs > 1
      ? `Pack ${packIdx + 1} of ${product.packs}`
      : product.name;
  document.getElementById('opening-pack-counter').textContent =
    product.packs > 1 ? `${product.name}` : '';

  // Buttons
  setOpeningButtons('reveal');
  buildDots();
  clearRevealedStrip();
  showCardBack();
}

function buildDots() {
  const dots = document.getElementById('progress-dots');
  const count = opening.packs[opening.packIdx].length;
  dots.innerHTML = Array.from({ length: count }, (_, i) =>
    `<span class="dot" data-i="${i}"></span>`).join('');
}

function updateDots() {
  document.querySelectorAll('#progress-dots .dot').forEach((dot, i) => {
    dot.classList.toggle('dot-revealed', i < opening.cardIdx);
    dot.classList.toggle('dot-current',  i === opening.cardIdx);
  });
}

function setOpeningButtons(mode) {
  // mode: 'reveal' | 'done-pack' | 'done-all'
  const btnReveal    = document.getElementById('btn-reveal');
  const btnRevealAll = document.getElementById('btn-reveal-all');
  const btnNextPack  = document.getElementById('btn-next-pack');
  const btnCollect   = document.getElementById('btn-collect-all');

  btnReveal.classList.toggle('hidden',    mode !== 'reveal');
  btnRevealAll.classList.toggle('hidden', mode !== 'reveal');
  btnNextPack.classList.toggle('hidden',  mode !== 'done-pack');
  btnCollect.classList.toggle('hidden',   mode !== 'done-pack' && mode !== 'done-all');
}

function showCardBack() {
  updateDots();
  const front  = document.getElementById('flip-front');
  const flipEl = document.getElementById('flip-container');
  front.innerHTML = '';
  flipEl.classList.remove('flipped');
}

function revealNextCard() {
  if (opening.animating) return;
  const pack = opening.packs[opening.packIdx];
  if (opening.cardIdx >= pack.length) return;

  opening.animating = true;
  const card = pack[opening.cardIdx];

  // Pre-render card face into the flip-front div
  document.getElementById('flip-front').innerHTML = buildCardHTML(card, 'lg');

  // Trigger flip
  const flipEl = document.getElementById('flip-container');
  flipEl.classList.add('flipped');

  setTimeout(() => {
    opening.revealed.push(card);
    opening.allRevealed.push(card);
    addToStrip(card);
    trackPull(card);

    const rCfg = RARITY_CONFIG[card.rarity] || {};
    if (rCfg.tier >= 4) triggerRareEffect(card);

    opening.cardIdx++;
    updateDots();

    setTimeout(() => {
      opening.animating = false;
      if (opening.cardIdx >= pack.length) {
        packComplete();
      } else {
        showCardBack();
      }
    }, rCfg.tier >= 7 ? 1800 : rCfg.tier >= 5 ? 1200 : 900);

  }, 650); // after flip
}

function revealAll() {
  if (opening.animating) return;
  const pack = opening.packs[opening.packIdx];

  // Instantly add all unrevealed cards
  while (opening.cardIdx < pack.length) {
    const card = pack[opening.cardIdx];
    opening.revealed.push(card);
    opening.allRevealed.push(card);
    addToStrip(card);
    trackPull(card);
    opening.cardIdx++;
  }

  updateDots();
  packComplete();
}

function packComplete() {
  // Show best pull notification
  const best = opening.revealed.reduce((b, c) => {
    if (!b) return c;
    const tb = RARITY_CONFIG[b.rarity]?.tier || 0;
    const tc = RARITY_CONFIG[c.rarity]?.tier || 0;
    return tc > tb || (tc === tb && c.price > b.price) ? c : b;
  }, null);
  if (best) {
    const rcfg = RARITY_CONFIG[best.rarity] || {};
    if (rcfg.tier >= 5) toast(`${rcfg.label}! ${best.name}`, rcfg.rainbow ? 'rainbow' : 'gold');
  }

  // Show all-cards summary in flip area
  showPackSummary(opening.revealed);

  const isLast = opening.packIdx >= opening.packs.length - 1;
  setOpeningButtons(isLast ? 'done-all' : 'done-pack');

  // Update title
  document.getElementById('opening-title').textContent = 'Pack Complete!';
  document.getElementById('opening-pack-counter').textContent =
    `${opening.revealed.length} cards`;
}

function showPackSummary(cards) {
  // Hide the flip card, show the summary grid instead
  document.getElementById('flip-container').classList.add('hidden');

  const sorted = [...cards].sort((a, b) =>
    (RARITY_CONFIG[a.rarity]?.tier || 0) - (RARITY_CONFIG[b.rarity]?.tier || 0));

  const summary = document.getElementById('pack-summary');
  summary.innerHTML = `
    <div class="summary-grid">
      ${sorted.map(c => `<div class="summary-card">${buildCardHTML(c, 'sm')}</div>`).join('')}
    </div>`;
  summary.classList.remove('hidden');

  setTimeout(() => {
    summary.querySelectorAll('.poke-card.holo, .poke-card.rainbow').forEach(attachHolo);
  }, 80);
}

function openNextPack() {
  opening.packIdx++;
  if (opening.packIdx >= opening.packs.length) {
    collectAll();
    return;
  }

  // Restore flip container, hide summary
  document.getElementById('pack-summary').classList.add('hidden');
  const flipEl = document.getElementById('flip-container');
  flipEl.classList.remove('hidden', 'flipped');

  loadPack();
}

function collectAll() {
  opening.allRevealed.forEach(card => {
    state.collection[card.id] = (state.collection[card.id] || 0) + 1;
  });
  updateBestPull(opening.allRevealed);
  save();

  hideOverlay();

  // Reset overlay DOM for next use
  document.getElementById('pack-summary').classList.add('hidden');
  document.getElementById('pack-summary').innerHTML = '';
  const flipEl = document.getElementById('flip-container');
  flipEl.classList.remove('hidden', 'flipped');
  document.getElementById('flip-front').innerHTML = '';

  const n = opening.allRevealed.length;
  opening = null;

  toast(`${n} cards added to collection!`, 'success');
  renderInventory();
}

function trackPull(card) {
  state.stats.pullsByRarity = state.stats.pullsByRarity || {};
  state.stats.pullsByRarity[card.rarity] =
    (state.stats.pullsByRarity[card.rarity] || 0) + 1;
}

function updateBestPull(cards) {
  const best = cards.reduce((b, c) => {
    if (!b) return c;
    const tb = RARITY_CONFIG[b.rarity]?.tier || 0;
    const tc = RARITY_CONFIG[c.rarity]?.tier || 0;
    return tc > tb || (tc === tb && c.price > b.price) ? c : b;
  }, state.stats.bestPull);
  state.stats.bestPull = best;
}

// Revealed strip (small thumbnails of revealed cards so far)
function clearRevealedStrip() {
  document.getElementById('revealed-strip').innerHTML = '';
}

function addToStrip(card) {
  const strip = document.getElementById('revealed-strip');
  const div   = document.createElement('div');
  div.className = `strip-card rarity-${card.rarity}`;
  div.title     = `${card.name} · ${RARITY_CONFIG[card.rarity]?.label || card.rarity}`;
  div.innerHTML = `<span class="strip-sym">${RARITY_CONFIG[card.rarity]?.symbol || '?'}</span>`;
  strip.appendChild(div);
  strip.scrollLeft = strip.scrollWidth; // scroll to new card
}

// ═══════════════════════════════════════════════════════════
// RARE REVEAL EFFECT
// ═══════════════════════════════════════════════════════════
function triggerRareEffect(card) {
  const rcfg  = RARITY_CONFIG[card.rarity] || {};
  const stage = document.getElementById('card-stage');

  const flash = document.createElement('div');
  flash.className = `rare-flash flash-${rcfg.rainbow ? 'rainbow' : rcfg.tier >= 7 ? 'gold' : 'holo'}`;
  stage.appendChild(flash);
  setTimeout(() => flash.remove(), 800);
}

// ═══════════════════════════════════════════════════════════
// CARD RENDERING
// ═══════════════════════════════════════════════════════════
function buildCardHTML(card, size = 'md') {
  const tc = TYPE_CONFIG[card.type] || TYPE_CONFIG.Colorless;
  const rc = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.common;

  const classes = [
    'poke-card',
    `sz-${size}`,
    `rar-${card.rarity}`,
    rc.holo    ? 'holo'    : '',
    rc.rainbow ? 'rainbow' : '',
  ].filter(Boolean).join(' ');

  // Fallback CSS card (shown when image is absent or fails to load)
  const fallback = `
    <div class="card-fallback">
      <div class="card-head">
        <span class="card-name">${card.name}</span>
        ${card.hp ? `<span class="card-hp">${card.hp}<small>HP</small></span>` : ''}
      </div>
      <div class="card-type-tag" style="background:${tc.primary};color:${tc.text}">
        <span class="type-sym">${tc.symbol}</span>
        <span class="type-label">${card.type}</span>
      </div>
      <div class="card-art-fb" style="background:linear-gradient(135deg,${tc.primary}55,${tc.secondary}cc)">
        <span class="art-type-sym">${tc.symbol}</span>
      </div>
      <div class="card-foot">
        <span class="rar-dot-${card.rarity}">${rc.symbol} ${rc.label}</span>
        <span class="card-num">${card.num}</span>
      </div>
    </div>`;

  return `
    <div class="${classes}" data-card-id="${card.id}"
         style="--tp:${tc.primary};--ts:${tc.secondary}">
      ${card.img
        ? `<img class="card-image" src="${card.img}" alt="${card.name}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      ${fallback}
      ${rc.holo ? '<div class="card-holo-overlay"></div>' : ''}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// HOLO MOUSE-TRACKING EFFECT
// Works over the real card image via .card-holo-overlay
// ═══════════════════════════════════════════════════════════
function attachHolo(el) {
  el.addEventListener('mousemove', e => {
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width;
    const y  = (e.clientY - r.top)  / r.height;
    const rx = (y - 0.5) * -18;
    const ry = (x - 0.5) *  18;
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.07)`;

    const ov = el.querySelector('.card-holo-overlay');
    if (ov) {
      ov.style.background = el.classList.contains('rainbow')
        ? `radial-gradient(circle at ${x*100}% ${y*100}%,
            rgba(255,0,100,0.25) 0%,rgba(255,200,0,0.18) 25%,
            rgba(0,255,120,0.18) 50%,rgba(0,100,255,0.18) 75%,transparent 100%)`
        : `radial-gradient(circle at ${x*100}% ${y*100}%,
            rgba(255,255,255,0.35) 0%,rgba(180,100,255,0.15) 35%,transparent 65%)`;
    }
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    const ov = el.querySelector('.card-holo-overlay');
    if (ov) ov.style.background = '';
  });
}

// ═══════════════════════════════════════════════════════════
// COLLECTION
// ═══════════════════════════════════════════════════════════
let collectionView = 'owned';

function renderCollection() {
  const grid   = document.getElementById('collection-grid');
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const rarF   = document.getElementById('filter-rarity').value;
  const typF   = document.getElementById('filter-type').value;

  const totalUnique = Object.keys(CARDS).length;
  const foundUnique = Object.keys(state.collection).filter(id => state.collection[id] > 0).length;
  document.getElementById('collection-progress').textContent =
    `${foundUnique} / ${totalUnique} unique cards`;

  if (collectionView === 'missing') {
    renderMissing(grid, search, rarF, typF);
  } else {
    renderOwned(grid, search, rarF, typF);
  }
}

function applyFilters(cards, search, rarF, typF) {
  return cards
    .filter(card => !search || card.name.toLowerCase().includes(search))
    .filter(card => !rarF || card.rarity === rarF)
    .filter(card => !typF || card.type === typF)
    .sort((a, b) => (a.sortKey || 9999) - (b.sortKey || 9999));
}

function renderOwned(grid, search, rarF, typF) {
  const entries = Object.entries(state.collection)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => ({ card: CARDS[id], qty }))
    .filter(({ card }) => card)
    .filter(({ card }) => !search || card.name.toLowerCase().includes(search))
    .filter(({ card }) => !rarF   || card.rarity === rarF)
    .filter(({ card }) => !typF   || card.type   === typF)
    .sort((a, b) => (a.card.sortKey || 9999) - (b.card.sortKey || 9999));

  if (!entries.length) {
    grid.innerHTML = `<div class="empty-state">
      ${Object.keys(state.collection).length === 0
        ? 'No cards yet — open packs to fill your collection!'
        : 'No cards match your filters.'}
    </div>`;
    return;
  }

  grid.innerHTML = entries.map(({ card, qty }) => `
    <div class="coll-slot" data-id="${card.id}">
      ${buildCardHTML(card, 'sm')}
      ${qty > 1 ? `<span class="qty-badge">×${qty}</span>` : ''}
      <div class="card-sell-bar">
        <span class="sell-label">$${card.price.toFixed(2)}</span>
        <button class="btn-sell" data-id="${card.id}" data-val="${card.sell}">
          Sell +${card.sell}T
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-sell').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      sellCard(btn.dataset.id, +btn.dataset.val);
    }));

  grid.querySelectorAll('.poke-card.holo, .poke-card.rainbow').forEach(attachHolo);
}

function renderMissing(grid, search, rarF, typF) {
  const owned   = new Set(Object.keys(state.collection).filter(id => state.collection[id] > 0));
  const missing = applyFilters(
    Object.values(CARDS).filter(card => !owned.has(card.id)),
    search, rarF, typF
  );

  if (!missing.length) {
    grid.innerHTML = `<div class="empty-state">
      ${owned.size === Object.keys(CARDS).length
        ? 'You have every card in the set!'
        : 'No missing cards match your filters.'}
    </div>`;
    return;
  }

  grid.innerHTML = missing.map(card => `
    <div class="coll-slot missing" data-id="${card.id}">
      ${buildCardHTML(card, 'sm')}
      <div class="missing-overlay">
        <span class="missing-lock">?</span>
      </div>
      <div class="card-sell-bar">
        <span class="sell-label missing-price">$${card.price.toFixed(2)}</span>
        <span class="missing-tag">${RARITY_CONFIG[card.rarity]?.label || card.rarity}</span>
      </div>
    </div>
  `).join('');
}

function sellCard(id, val) {
  if (!(state.collection[id] > 0)) return;
  state.collection[id]--;
  state.tokens += val;
  state.stats.tokensEarned = (state.stats.tokensEarned || 0) + val;
  save();
  refreshTokenDisplay();
  renderCollection();
  toast(`Sold ${CARDS[id]?.name} for ${val} tokens`, 'success');
}

function sellDuplicates() {
  let earned = 0, sold = 0;
  Object.entries(state.collection).forEach(([id, qty]) => {
    if (qty < 2) return;
    const extra = qty - 1;
    const card  = CARDS[id];
    if (!card) return;
    state.collection[id] = 1;
    earned += extra * card.sell;
    sold   += extra;
  });
  if (!sold) { toast('No duplicates to sell', 'info'); return; }
  state.tokens += earned;
  state.stats.tokensEarned = (state.stats.tokensEarned || 0) + earned;
  save();
  refreshTokenDisplay();
  renderCollection();
  toast(`Sold ${sold} duplicate${sold > 1 ? 's' : ''} for ${earned} tokens`, 'success');
}

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════
function renderStats() {
  const s    = state.stats;
  const col  = state.collection;

  const colValue = Object.entries(col)
    .reduce((sum, [id, qty]) => sum + (CARDS[id]?.price || 0) * qty, 0);

  const found   = Object.keys(col).filter(id => col[id] > 0).length;
  const total   = Object.keys(CARDS).length;
  const pct     = total ? Math.round(found / total * 100) : 0;

  const rarityRows = Object.entries(s.pullsByRarity || {})
    .sort((a, b) => (RARITY_CONFIG[b[0]]?.tier || 0) - (RARITY_CONFIG[a[0]]?.tier || 0))
    .map(([r, n]) => `
      <div class="stat-row">
        <span class="sr-label rar-dot-${r}">${RARITY_CONFIG[r]?.label || r}</span>
        <span class="sr-val">${n}</span>
      </div>`).join('');

  document.getElementById('stats-content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-box">
        <h3>Opening Stats</h3>
        <div class="stat-row"><span>Packs Opened</span><span>${s.packsOpened || 0}</span></div>
        <div class="stat-row"><span>Tokens Spent</span><span>${Math.floor(s.tokensSpent || 0).toLocaleString()}T</span></div>
        <div class="stat-row"><span>Tokens Earned</span><span>${Math.floor(s.tokensEarned || 0).toLocaleString()}T</span></div>
        <div class="stat-row"><span>Current Balance</span><span>${Math.floor(state.tokens).toLocaleString()}T</span></div>
      </div>

      <div class="stat-box">
        <h3>Collection</h3>
        <div class="stat-highlight">$${colValue.toFixed(2)}<small>est. value</small></div>
        <div class="stat-row">
          <span>Completion</span>
          <span>${found} / ${total} (${pct}%)</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${pct}%"></div>
        </div>
        ${s.bestPull ? `
          <div class="stat-row best-pull-row">
            <span>Best Pull</span>
            <span class="rar-dot-${s.bestPull.rarity}">${s.bestPull.name}</span>
          </div>` : ''}
      </div>

      <div class="stat-box stat-full">
        <h3>Cards by Rarity</h3>
        ${rarityRows || '<p class="muted">No cards pulled yet</p>'}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-show'));
  setTimeout(() => {
    el.classList.remove('toast-show');
    setTimeout(() => el.remove(), 350);
  }, 3200);
}

// ═══════════════════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════════════════
function setupReset() {
  document.getElementById('reset-btn').addEventListener('click', () =>
    document.getElementById('reset-modal').classList.remove('hidden'));
  document.getElementById('reset-cancel').addEventListener('click', () =>
    document.getElementById('reset-modal').classList.add('hidden'));
  document.getElementById('reset-confirm').addEventListener('click', () => {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });
}

// ═══════════════════════════════════════════════════════════
// OPENING OVERLAY EVENT WIRING
// ═══════════════════════════════════════════════════════════
function setupOpeningOverlay() {
  document.getElementById('btn-reveal').addEventListener('click', revealNextCard);
  document.getElementById('btn-reveal-all').addEventListener('click', revealAll);
  document.getElementById('btn-next-pack').addEventListener('click', openNextPack);
  document.getElementById('btn-collect-all').addEventListener('click', collectAll);
  document.getElementById('opening-close').addEventListener('click', () => {
    if (!opening) { hideOverlay(); return; }
    collectAll();
  });

  // Click the card back to reveal (when flip-container is visible and not mid-flip)
  document.getElementById('flip-container').addEventListener('click', () => {
    const flipEl = document.getElementById('flip-container');
    if (!flipEl.classList.contains('hidden') && !flipEl.classList.contains('flipped')) {
      revealNextCard();
    }
  });
}

// ═══════════════════════════════════════════════════════════
// COLLECTION CONTROLS
// ═══════════════════════════════════════════════════════════
function setupCollectionControls() {
  document.getElementById('search-input').addEventListener('input', renderCollection);
  document.getElementById('filter-rarity').addEventListener('change', renderCollection);
  document.getElementById('filter-type').addEventListener('change', renderCollection);
  document.getElementById('sell-dupes-btn').addEventListener('click', sellDuplicates);

  document.getElementById('view-owned').addEventListener('click', () => {
    collectionView = 'owned';
    document.getElementById('view-owned').classList.add('active');
    document.getElementById('view-missing').classList.remove('active');
    renderCollection();
  });
  document.getElementById('view-missing').addEventListener('click', () => {
    collectionView = 'missing';
    document.getElementById('view-missing').classList.add('active');
    document.getElementById('view-owned').classList.remove('active');
    renderCollection();
  });
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
function init() {
  refreshTokenDisplay();
  setupTabs();
  setupReset();
  setupOpeningOverlay();
  setupCollectionControls();
  renderShop();
  startTicker();

  if (state.firstVisit) {
    state.firstVisit = false;
    save();
    setTimeout(() =>
      toast('Welcome! You start with 500 tokens. Earn 50T/hour passively. Buy packs in the Shop!', 'info'),
      500);
  }
}

document.addEventListener('DOMContentLoaded', init);
