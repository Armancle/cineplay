/* CinePlay - Global Application Script */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();
  initBackToTop();
  initMobileMenu();
  initLazyLoading();
  initIntersectionObserver();
  initNewsletter();

  // Modern UI Components
  initMoodQuizModal();
  initVideoTrailerModal();
  initLiveSearchAutoSuggestions();

  // Auto-init Home Page features if elements are present
  if (document.getElementById("hero-slider")) {
    initHomePage();
  }
});

/* ==========================================================================
   1. Simulated API Client (Decoupled Data Layer)
   ========================================================================== */
/* Item registry: stores full item object keyed by item.id for reliable detail lookups */
window._cineItemRegistry = {};

const CinePlayAPI = {
  // Fetches movies via CinePlayDataManager (TMDB -> Firestore -> Local Fallback)
  async fetchMovies(params = {}) {
    //rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
    // ✅ Use the Data Manager which handles API + fallback internally
    if (window.CinePlayDataManager) {
      try {
        const result = await window.CinePlayDataManager.fetchMovies(params);
        // ✅ If we got results from API, return them immediately
        if (result && result.results && result.results.length > 0) {
          return result;
        }
        // If DataManager returned empty but we have local data, fallback here
        if (window.moviesData && window.moviesData.length > 0) {
          console.warn("[CinePlayAPI] DataManager returned empty, using local fallback");
          let movies = [...window.moviesData];
          if (params.query) movies = CinePlay.searchItems(movies, params.query);
          if (params.genre && params.genre !== "All") movies = CinePlay.filterByGenre(movies, params.genre);
          CinePlay.sortItems(movies, params.sortBy || "rating-desc");
          const limit = params.limit || 20;
          const page = params.page || 1;
          const start = (page - 1) * limit;
          const end = start + limit;
          const paginated = movies.slice(start, end);
          return { results: paginated, total: movies.length, hasMore: end < movies.length };
        }
        return result || { results: [], total: 0, hasMore: false };
      } catch (error) {
        console.warn("[CinePlayAPI] DataManager fetch failed:", error);
        // Fallback to local if DataManager fails
        return this._fallbackToLocalMovies(params);
      }
    }
    // If no DataManager, fallback to local
    return this._fallbackToLocalMovies(params);
  },

  // Helper method for local fallback
  _fallbackToLocalMovies(params = {}) {
    let movies = window.moviesData ? [...window.moviesData] : [];
    if (params.query) movies = CinePlay.searchItems(movies, params.query);
    if (params.genre && params.genre !== "All") movies = CinePlay.filterByGenre(movies, params.genre);
    CinePlay.sortItems(movies, params.sortBy || "rating-desc");
    const limit = params.limit || 20;
    const page = params.page || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = movies.slice(start, end);
    return { results: paginated, total: movies.length, hasMore: end < movies.length };
  },

  // Recommendations calculation engine
  async fetchRecommendations(criteria) {
    await simulateNetworkDelay(400);

    let movies = window.moviesData;
    let games = window.gamesData;

    // Pull the freshest dataset from the live API layer if it exists,
    // instead of always scoring against the static local fallback.
    if (window.CinePlayDataManager) {
      try {
        if (criteria.contentType === "game") {
          const res = await window.CinePlayDataManager.fetchGames({ limit: 500 });
          if (res && res.results && res.results.length) games = res.results;
        } else {
          const res = await window.CinePlayDataManager.fetchMovies({ limit: 500 });
          if (res && res.results && res.results.length) movies = res.results;
        }
      } catch (err) {
        console.warn("CinePlayDataManager fetch failed, using local dataset:", err);
      }
    }

    return CinePlay.getRecommendations(criteria, { movies, games });
  }
};

function simulateNetworkDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ==========================================================================
   2. Decoupled Core Logic Functions (Reusable Utility Layers)
   ========================================================================== */

// Searches items (movies or games) by title or genres
function searchItems(items, query) {
  const q = query.toLowerCase().trim();
  return items.filter(item =>
    item.title.toLowerCase().includes(q) ||
    (item.genre && item.genre.some(g => g.toLowerCase().includes(q))) ||
    (item.mood && item.mood.some(m => m.toLowerCase().includes(q)))
  );
}

// Filters items by genre name
function filterByGenre(items, genre) {
  if (genre === "All") return items;
  return items.filter(item => item.genre && item.genre.includes(genre));
}

// Sorts items in place based on selected sorting metric
function sortItems(items, sortBy) {
  items.sort((a, b) => {
    if (sortBy === "rating-desc") return b.rating - a.rating;
    if (sortBy === "rating-asc") return a.rating - b.rating;
    if (sortBy === "year-desc") return b.year - a.year;
    if (sortBy === "year-asc") return a.year - b.year;
    return 0;
  });
  return items;
}

// Maps the quiz's user-facing mood labels to the internal mood tags
// used in data.js / the live API's mood field. Update the KEYS on the
// left if your quiz card data-value attributes differ from these.
const MOOD_QUIZ_TO_TAGS = {
  "Thrilled & Hyped": ["Action-packed", "Suspenseful"],
  "Chill & Cozy": ["Relaxing", "Emotional"],
  "Mind-Bending": ["Thought-provoking", "Suspenseful"],
  "Deep & Emotional": ["Emotional", "Thought-provoking"],
  "Spooky Thrill": ["Scary", "Suspenseful"],
  "Fun & Lighthearted": ["Relaxing", "Emotional"]
};

// Recommendations scoring algorithm
function getRecommendations({ contentType = "movie", mood = "Action-packed", genre = "All", era = "any", platform = "any", runtimeMax = 999 }, overrideData = {}) {
  const dataset = contentType === "movie"
    ? (overrideData.movies || window.moviesData)
    : (overrideData.games || window.gamesData);

  if (!dataset || dataset.length === 0) return [];

  const moodTags = MOOD_QUIZ_TO_TAGS[mood] || [mood];

  const matchedList = dataset.map(item => {
    let score = 0;

    // 1. Mood match (Weight: 40 points)
    if (item.mood && item.mood.some(m => moodTags.includes(m))) {
      score += 40;
    } else if (item.mood && item.mood.some(m => moodTags.some(t => m.toLowerCase().includes(t.toLowerCase())))) {
      score += 25;
    }

    // 2. Genre match (Weight: 30 points)
    if (genre === "All" || (item.genre && item.genre.includes(genre))) {
      score += 30;
    }

    // 3. Era match (Weight: 20 points)
    let yearMatch = false;
    if (era === "classic" && item.year < 2010) yearMatch = true;
    else if (era === "golden" && item.year >= 2010 && item.year <= 2019) yearMatch = true;
    else if (era === "modern" && item.year >= 2020) yearMatch = true;
    else if (era === "any") yearMatch = true;

    if (yearMatch) {
      score += 20;
    }

    // 4. Runtime / Platform Match (Weight: 10 points)
    if (contentType === "game") {
      let platformMatch = false;
      if (platform === "any" || (item.platform && item.platform.includes(platform))) {
        platformMatch = true;
      }
      if (platformMatch) score += 10;
    } else {
      if (!item.runtime || item.runtime <= runtimeMax) {
        score += 10;
      } else {
        score += 5;
      }
    }

    return {
      item,
      score: Math.min(score, 99)
    };
  });

  // Sort and filter results
  return matchedList
    .filter(match => match.score >= 40)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating);
}

/* ==========================================================================
   3. UI Rendering Engine (Decoupled Card & List Renderers)
   ========================================================================== */

// Renders list of movie cards into specified container
// Renders list of movie cards into specified container
function renderMovies(movies, containerElement, append = false) {
  if (!containerElement) return;
  if (movies.length === 0) {
    if (!append) containerElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No movies found matching your criteria.</div>`;
    return;
  }

  // 🔧 FIX: Generate cards HTML
  const cardsHtml = movies.map(movie => createMovieCardHTML(movie)).join("");

  if (append) {
    // 🔧 FIX: Only append new cards, don't duplicate existing ones
    containerElement.insertAdjacentHTML("beforeend", cardsHtml);
  } else {
    containerElement.innerHTML = cardsHtml;
  }

  // 🔧 FIX: Re-bind click events for all cards in container (including existing ones)
  bindCardClickEvents(containerElement, "movie");
}

// Renders list of game cards into specified container
function renderGames(games, containerElement, append = false) {
  if (!containerElement) return;
  if (games.length === 0) {
    if (!append) containerElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No games found matching your criteria.</div>`;
    return;
  }
  const cardsHtml = games.map(game => createGameCardHTML(game)).join("");
  if (append) {
    containerElement.insertAdjacentHTML("beforeend", cardsHtml);
  } else {
    containerElement.innerHTML = cardsHtml;
  }
  bindCardClickEvents(containerElement, "game");
}

/// Dynamic templates
function createMovieCardHTML(movie) {
  // Store in registry for reliable detail modal lookup
  window._cineItemRegistry[movie.id] = movie;

  const isFav = isFavorite(movie.id);
  const streamingBadges = movie.providers && movie.providers.IN && movie.providers.IN.flatrate
    ? movie.providers.IN.flatrate.slice(0, 2).map(s => `<span class="streaming-badge">${s.name}</span>`).join("")
    : (movie.streaming ? movie.streaming.slice(0, 2).map(s => `<span class="streaming-badge">${s}</span>`).join("") : "");

  const trailerKey = movie.trailerKey || movie.trailer || "";
  const runtime = movie.runtime ? (typeof movie.runtime === 'number' ? `${movie.runtime}m` : movie.runtime) : (movie.duration || '—');

  return `
    <article class="media-card" data-id="${movie.id}" data-type="movie">
      <div class="card-img-wrapper shimmer-wrapper">
        <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy" onerror="CinePlay.movieImgFallback(this, '${movie.title.replace(/'/g, "\\'")}')"> 
        <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${movie.rating}</div>
        <button class="card-favorite-btn ${isFav ? 'active' : ''}" aria-label="Favorite button" onclick="event.stopPropagation(); CinePlay.handleFavoriteAction(this, '${movie.id}', 'movie')">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <span class="card-type-tag">Movie</span>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${movie.year}</span>
          <span>${runtime}</span>
        </div>
        <h3 class="card-title">${movie.title}</h3>
        <div class="card-genres">
          ${(movie.genres || movie.genre || ["Action"]).slice(0, 3).map(g => `<span class="card-genre-tag">${g}</span>`).join("")}
        </div>
        <p class="card-desc">${movie.overview || movie.description || 'No overview available.'}</p>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="card-btn" style="flex: 1;">Details</button>
          ${trailerKey ? `<button class="card-btn btn-outline" style="padding: 0 12px; border-radius: 8px;" title="Watch Trailer" onclick="event.stopPropagation(); CinePlay.openTrailerModal('${trailerKey}', '${movie.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-play"></i></button>` : ''}
        </div>
        ${streamingBadges ? `<div class="streaming-list">${streamingBadges}</div>` : ''}
      </div>
    </article>
  `;
}

function createGameCardHTML(game) {
  // Store in registry for reliable detail modal lookup
  window._cineItemRegistry[game.id] = game;

  const isFav = isFavorite(game.id);
  const platforms = game.platform || [];
  return `
    <article class="media-card" data-id="${game.id}" data-type="game">
      <div class="card-img-wrapper shimmer-wrapper">
        <img src="${game.cover || game.poster || 'images/posters/g1.jpg'}" alt="${game.title}" class="card-img" loading="lazy" onerror="CinePlay.gameImgFallback(this, '${game.title}')">
        <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${game.rating}</div>
        <button class="card-favorite-btn ${isFav ? 'active' : ''}" aria-label="Favorite button" onclick="event.stopPropagation(); CinePlay.handleFavoriteAction(this, '${game.id}', 'game')">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <span class="card-type-tag">Game</span>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${game.year}</span>
          <span style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${platforms.slice(0, 2).join(", ")}${platforms.length > 2 ? '...' : ''}
          </span>
        </div>
        <h3 class="card-title">${game.title}</h3>
        <div class="card-genres">
          ${(game.genres || game.genre || []).slice(0, 3).map(g => `<span class="card-genre-tag">${g}</span>`).join("")}
        </div>
        <p class="card-desc">${game.description || game.overview || ''}</p>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="card-btn" style="flex: 1;">Details</button>
          ${game.trailer ? `<button class="card-btn btn-outline" style="padding: 0 12px; border-radius: 8px;" title="Watch Trailer" onclick="event.stopPropagation(); CinePlay.openTrailerModal('${game.trailer}', '${game.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-play"></i></button>` : ''}
        </div>
      </div>
    </article>
  `;
}

function bindCardClickEvents(container, type) {
  const cards = container.querySelectorAll(".media-card");
  cards.forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't trigger on favorite/trailer button clicks
      if (e.target.closest(".card-favorite-btn") || e.target.closest(".card-btn.btn-outline")) return;

      const id = card.dataset.id;

      // 1. Check registry first (works for TMDB-sourced items too)
      let item = window._cineItemRegistry[id];

      // 2. Fall back to local datasets
      if (!item) {
        const dataSet = type === "movie" ? window.moviesData : window.gamesData;
        item = dataSet ? dataSet.find(i => i.id === id) : null;
      }

      if (item) {
        openDetailsModal(item, type);
      } else {
        // 3. Last resort: fetch from TMDB if it's a tmdb_ id
        if (id && id.startsWith("tmdb_") && window.CinePlayAPIService) {
          const tmdbId = id.replace("tmdb_", "");
          showToast("Loading details…", "fa-spinner");
          CinePlayAPIService.getTMDBMovieDetails(tmdbId).then(data => {
            if (data) {
              const normalized = CinePlayAPIService.normalizeMovie(data);
              window._cineItemRegistry[id] = normalized;
              openDetailsModal(normalized, "movie");
            }
          });
        }
      }
    });
  });
}

function movieImgFallback(img, title) {
  const parent = img.parentElement;
  if (!parent) return;
  const score = img.nextElementSibling ? img.nextElementSibling.textContent.trim() : "8.0";
  parent.innerHTML = `
    <div class="fallback-poster">
      <i class="fa-solid fa-film"></i>
      <div class="fallback-title">${title}</div>
    </div>
    <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${score}</div>
    <span class="card-type-tag">Movie</span>
  `;
}

function gameImgFallback(img, title) {
  const parent = img.parentElement;
  if (!parent) return;
  const score = img.nextElementSibling ? img.nextElementSibling.textContent.trim() : "9.0";
  parent.innerHTML = `
    <div class="fallback-poster">
      <i class="fa-solid fa-gamepad"></i>
      <div class="fallback-title">${title}</div>
    </div>
    <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${score}</div>
    <span class="card-type-tag">Game</span>
  `;
}

function handleFavoriteAction(btn, id, type) {
  const isFavNow = toggleFavorite(id, type);
  const icon = btn.querySelector("i");
  if (isFavNow) {
    btn.classList.add("active");
    icon.className = "fa-solid fa-heart";
  } else {
    btn.classList.remove("active");
    icon.className = "fa-regular fa-heart";
  }
}

/* ==========================================================================
   4. LocalStorage Favorites Hooks
   ========================================================================== */
const FAVORITES_KEY = "cineplay_favorites";

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favoritesChanged"));
  if (window.CinePlayAuth && window.CinePlayAuth.isLoggedIn()) {
    window.CinePlayAuth.syncFavoritesToCloud(favorites);
  }
}

function toggleFavorite(itemId, itemType) {
  let favorites = getFavorites();
  const index = favorites.findIndex(item => item.id === itemId);

  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    showToast("Removed from Watchlist", "fa-regular fa-heart");
    return false;
  } else {
    favorites.push({ id: itemId, type: itemType });
    saveFavorites(favorites);
    showToast("Saved to your Watchlist! ❤️", "fa-solid fa-heart");
    return true;
  }
}

function isFavorite(itemId) {
  const favorites = getFavorites();
  return favorites.some(item => item.id === itemId);
}

/* ==========================================================================
   5. Dynamic Details Modal Overlay
   ========================================================================== */
let globalModal = null;

function initModalElement() {
  if (globalModal) return;

  globalModal = document.createElement("div");
  globalModal.id = "details-modal";
  globalModal.className = "modal";
  globalModal.innerHTML = `
    <div class="modal-content glass-panel">
      <button class="modal-close" id="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-poster" id="modal-poster-container"></div>
      <div class="modal-body">
        <h2 class="modal-title" id="modal-title-text"></h2>
        <div class="modal-badges" id="modal-badges-container"></div>
        <p class="modal-desc" id="modal-desc-text"></p>
        <ul class="modal-info-list" id="modal-info-details"></ul>
        <div class="modal-actions" id="modal-actions-container"></div>
      </div>
    </div>
  `;

  document.body.appendChild(globalModal);

  // Close bindings
  const closeBtn = globalModal.querySelector("#modal-close-btn");
  closeBtn.addEventListener("click", closeModal);
  globalModal.addEventListener("click", (e) => {
    if (e.target === globalModal) closeModal();
  });
}

function openDetailsModal(item, type) {
  initModalElement();
  trackRecentlyViewed(item.id, type);

  if (item.id) window._cineItemRegistry[item.id] = item;

  // Reset scroll positions
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) modalContent.scrollTop = 0;
  const modalBody = document.querySelector('.modal-body');
  if (modalBody) modalBody.scrollTop = 0;

  // ... (rest of the existing code to render the modal)

  // ✅ If it's a movie and has tmdbId, try to fetch providers
  if (type === "movie" && item.tmdbId && window.CinePlayAPIService) {
    // Fetch providers in background
    CinePlayAPIService.getTMDBWatchProviders(item.tmdbId).then(providersData => {
      if (providersData && providersData.results) {
        // Store providers in the item
        item.providers = providersData.results;
        window._cineItemRegistry[item.id] = item;

        // Update the provider grid
        const providerGrid = document.getElementById("modal-provider-grid");
        if (providerGrid) {
          const config = window.CINEPLAY_CONFIG ? window.CINEPLAY_CONFIG.TMDB : { IMAGE_BASE: "https://image.tmdb.org/t/p", DEFAULT_REGION: "IN" };
          const regionData = providersData.results[config.DEFAULT_REGION] || providersData.results["US"] || {};
          const allP = [
            ...(regionData.flatrate || []).map(p => ({ ...p, type: "STREAM" })),
            ...(regionData.rent || []).map(p => ({ ...p, type: "RENT" })),
            ...(regionData.buy || []).map(p => ({ ...p, type: "BUY" }))
          ];

          if (allP.length > 0) {
            providerGrid.innerHTML = allP.slice(0, 6).map(p => `
              <div class="provider-card" title="${p.provider_name} (${p.type})">
                ${p.logo_path ? `<img src="${config.IMAGE_BASE}/w92${p.logo_path}" alt="${p.provider_name}" class="provider-logo" onerror="this.style.display='none'">` : `<i class="fa-solid fa-tv" style="color:var(--accent-red);"></i>`}
                <span class="provider-name">${p.provider_name}</span>
                <span class="provider-type-badge ${p.type.toLowerCase()}">${p.type}</span>
              </div>
            `).join("");
          }
        }
      }
    }).catch(err => {
      console.warn("Failed to fetch providers:", err);
    });
  }
}

// Build streaming provider grid from item data or honest empty state
// Build streaming provider grid from item data or honest empty state
function _buildProviderGrid(item) {
  const config = window.CINEPLAY_CONFIG ? window.CINEPLAY_CONFIG.TMDB : { DEFAULT_REGION: "IN" };
  const regionKey = config.DEFAULT_REGION || "IN";

  // ✅ Check multiple possible locations for provider data
  let providersList = [];

  // 1. Check item.providers (TMDB normalized format)
  if (item.providers && typeof item.providers === "object") {
    const region = item.providers[regionKey] || item.providers["US"] || {};
    providersList = [
      ...(region.flatrate || []).map(p => ({ ...p, type: "STREAM" })),
      ...(region.rent || []).map(p => ({ ...p, type: "RENT" })),
      ...(region.buy || []).map(p => ({ ...p, type: "BUY" }))
    ];
  }

  // 2. Check item.streaming (legacy format from data.js)
  if (providersList.length === 0 && item.streaming && Array.isArray(item.streaming)) {
    providersList = item.streaming.map(name => ({
      name: name,
      type: "STREAM",
      logo: null
    }));
  }

  // 3. Check if there's raw provider data in the item
  if (providersList.length === 0 && item.provider_data) {
    const region = item.provider_data[regionKey] || item.provider_data["US"] || {};
    providersList = [
      ...(region.flatrate || []).map(p => ({ ...p, type: "STREAM" })),
      ...(region.rent || []).map(p => ({ ...p, type: "RENT" })),
      ...(region.buy || []).map(p => ({ ...p, type: "BUY" }))
    ];
  }

  // 4. Check if the item has direct provider names
  if (providersList.length === 0 && item.provider_names && Array.isArray(item.provider_names)) {
    providersList = item.provider_names.map(name => ({
      name: name,
      type: "STREAM",
      logo: null
    }));
  }

  // If we have providers, render them
  if (providersList.length > 0) {
    // Remove duplicates by name
    const uniqueProviders = [];
    const seenNames = new Set();
    providersList.forEach(p => {
      if (!seenNames.has(p.name)) {
        seenNames.add(p.name);
        uniqueProviders.push(p);
      }
    });

    return uniqueProviders.slice(0, 6).map(p => `
      <div class="provider-card" title="${p.name} (${p.type})">
        ${p.logo ? `<img src="${p.logo}" alt="${p.name}" class="provider-logo" onerror="this.style.display='none'">` : `<i class="fa-solid fa-tv" style="color:var(--accent-red);"></i>`}
        <span class="provider-name">${p.name}</span>
        <span class="provider-type-badge ${p.type.toLowerCase()}">${p.type}</span>
      </div>
    `).join("");
  }

  // Honest unavailable state when no provider data exists
  return `<div class="provider-unavailable"><i class="fa-solid fa-circle-info"></i> Streaming availability currently unavailable for this region.</div>`;
}

// Async enrich open modal with live TMDB data (cast, trailer, providers)
async function _enrichModalWithTMDB(item) {
  try {
    const tmdbId = item.tmdbId;
    const [credits, videos, providers] = await Promise.all([
      CinePlayAPIService.getTMDBMovieCredits(tmdbId),
      CinePlayAPIService.getTMDBMovieVideos(tmdbId),
      CinePlayAPIService.getTMDBWatchProviders(tmdbId)
    ]);

    // Update cast row
    const castRow = document.getElementById("modal-cast-row");
    if (castRow && credits && credits.cast && credits.cast.length) {
      const castNames = credits.cast.slice(0, 6).map(c => c.name).join(", ");
      castRow.innerHTML = `<strong>Cast:</strong> ${castNames}`;
    }

    // Update trailer button if we found a valid YouTube trailer/teaser
    if (videos && videos.results && videos.results.length) {
      const trailer = videos.results.find(v => v.site === "YouTube" && v.type === "Trailer")
        || videos.results.find(v => v.site === "YouTube" && v.type === "Teaser");
      if (trailer && trailer.key) {
        item.trailerKey = trailer.key;
        item.trailer = trailer.key;
        window._cineItemRegistry[item.id] = item;
        // Update play button if modal still open
        const playBtn = document.getElementById("modal-play-btn");
        if (playBtn) {
          playBtn.style.display = "inline-flex";
          playBtn.onclick = () => openTrailerModal(trailer.key, item.title);
        } else {
          // Add trailer button if it wasn't there before
          const actionsContainer = document.getElementById("modal-actions-container");
          if (actionsContainer && !actionsContainer.querySelector("#modal-play-btn")) {
            const btn = document.createElement("button");
            btn.id = "modal-play-btn";
            btn.className = "btn btn-primary";
            btn.innerHTML = `<i class="fa-solid fa-play"></i> Watch Trailer`;
            btn.addEventListener("click", () => openTrailerModal(trailer.key, item.title));
            actionsContainer.prepend(btn);
          }
        }
      }
    }

    // Update providers section from live TMDB data
    const providerGrid = document.getElementById("modal-provider-grid");
    if (providerGrid && providers && providers.results) {
      const config = window.CINEPLAY_CONFIG ? window.CINEPLAY_CONFIG.TMDB : { IMAGE_BASE: "https://image.tmdb.org/t/p", DEFAULT_REGION: "IN" };
      const regionData = providers.results[config.DEFAULT_REGION] || providers.results["US"] || {};
      const allP = [
        ...(regionData.flatrate || []).map(p => ({ ...p, type: "STREAM" })),
        ...(regionData.rent || []).map(p => ({ ...p, type: "RENT" })),
        ...(regionData.buy || []).map(p => ({ ...p, type: "BUY" }))
      ];
      if (allP.length > 0) {
        providerGrid.innerHTML = allP.slice(0, 6).map(p => `
          <div class="provider-card" title="${p.provider_name} (${p.type})">
            ${p.logo_path ? `<img src="${config.IMAGE_BASE}/w92${p.logo_path}" alt="${p.provider_name}" class="provider-logo" onerror="this.style.display='none'">` : `<i class="fa-solid fa-tv" style="color:var(--accent-red);"></i>`}
            <span class="provider-name">${p.provider_name}</span>
            <span class="provider-type-badge ${p.type.toLowerCase()}">${p.type}</span>
          </div>
        `).join("");
      } else {
        providerGrid.innerHTML = `<div class="provider-unavailable"><i class="fa-solid fa-circle-info"></i> Streaming availability currently unavailable for this region.</div>`;
      }
    }
  } catch (e) {
    console.warn("[CinePlay] TMDB enrichment failed:", e);
  }
}

function closeModal() {
  if (!globalModal) return;
  globalModal.classList.remove("active");
  document.body.style.overflow = "";
}

/* ==========================================================================
   6. Video Trailer Player Modal Engine
   ========================================================================== */
let trailerModal = null;

function initVideoTrailerModal() {
  if (trailerModal) return;

  trailerModal = document.createElement("div");
  trailerModal.id = "video-trailer-modal";
  trailerModal.className = "video-modal-overlay";
  trailerModal.innerHTML = `
    <div class="video-modal-box">
      <div class="video-modal-header">
        <span class="video-modal-title" id="trailer-title">Trailer Preview</span>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a id="yt-direct-btn" href="#" target="_blank" class="btn btn-outline" style="padding: 6px 14px; font-size: 13px; border-radius: 20px; text-decoration: none;">
            <i class="fa-brands fa-youtube" style="color: #ff0000; margin-right: 4px;"></i> Open on YouTube ↗
          </a>
          <button class="quiz-close-btn" id="close-trailer-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
      <div class="video-wrapper">
        <iframe id="trailer-iframe" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(trailerModal);

  const closeBtn = trailerModal.querySelector("#close-trailer-btn");
  closeBtn.addEventListener("click", closeTrailerModal);
  trailerModal.addEventListener("click", (e) => {
    if (e.target === trailerModal) closeTrailerModal();
  });
}

function openTrailerModal(trailerId, title) {
  initVideoTrailerModal();
  const iframe = document.getElementById("trailer-iframe");
  const titleEl = document.getElementById("trailer-title");
  const ytBtn = document.getElementById("yt-direct-btn");

  if (trailerId) {
    if (iframe) iframe.src = `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0`;
    if (titleEl) titleEl.textContent = `${title} — Official Trailer`;
    if (ytBtn) ytBtn.href = `https://www.youtube.com/watch?v=${trailerId}`;
    trailerModal.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    showToast("Trailer preview coming soon!", "fa-solid fa-circle-info");
  }
}

function closeTrailerModal() {
  if (!trailerModal) return;
  const iframe = document.getElementById("trailer-iframe");
  if (iframe) iframe.src = "";
  trailerModal.classList.remove("active");
  document.body.style.overflow = "";
}

/* ==========================================================================
   7. Interactive Initial Load Mood Quiz Popup Wizard ("The Anti-Scroll Popup")
   ========================================================================== */
let moodQuizModal = null;
let currentQuizStep = 1;
const quizSelections = {
  mood: "Action-packed",
  timeOfDay: "Night",
  company: "Solo",
  duration: 130
};

function initMoodQuizModal() {
  if (moodQuizModal) return;

  moodQuizModal = document.createElement("div");
  moodQuizModal.id = "mood-quiz-modal";
  moodQuizModal.className = "mood-modal-overlay";
  moodQuizModal.innerHTML = `
    <div class="quiz-modal-box">
      <div class="quiz-modal-header">
        <div class="quiz-step-indicator">
          <span class="quiz-step-tag" id="quiz-step-tag">Step 1 of 4 • Mood</span>
          <button class="quiz-close-btn" id="close-quiz-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <h2 class="quiz-title" id="quiz-question-title">How are you feeling right now?</h2>
        <p class="quiz-subtitle" id="quiz-question-subtitle">Select your vibe and let CinePlay recommend the perfect movie.</p>
        <div class="quiz-progress-track">
          <div class="quiz-progress-bar" id="quiz-progress-bar" style="width: 25%;"></div>
        </div>
      </div>

      <div class="quiz-body">
        <!-- Step 1: Mood -->
        <div class="quiz-step-pane active" data-step="1">
          <div class="quiz-options-grid">
            <div class="quiz-option-card selected" data-value="Action-packed" onclick="selectQuizOption(this, 'mood', 'Action-packed')">
              <span class="quiz-option-icon">🍿</span>
              <div class="quiz-option-title">Thrilled & Hyped</div>
              <div class="quiz-option-desc">High energy action & thrills</div>
            </div>
            <div class="quiz-option-card" data-value="Relaxing" onclick="selectQuizOption(this, 'mood', 'Relaxing')">
              <span class="quiz-option-icon">🛋️</span>
              <div class="quiz-option-title">Chill & Cozy</div>
              <div class="quiz-option-desc">Relaxing stories to unwind</div>
            </div>
            <div class="quiz-option-card" data-value="Thought-provoking" onclick="selectQuizOption(this, 'mood', 'Thought-provoking')">
              <span class="quiz-option-icon">🧠</span>
              <div class="quiz-option-title">Mind-Bending</div>
              <div class="quiz-option-desc">Plot twists & deep themes</div>
            </div>
            <div class="quiz-option-card" data-value="Emotional" onclick="selectQuizOption(this, 'mood', 'Emotional')">
              <span class="quiz-option-icon">😭</span>
              <div class="quiz-option-title">Deep & Emotional</div>
              <div class="quiz-option-desc">Heartfelt dramas & stories</div>
            </div>
            <div class="quiz-option-card" data-value="Scary" onclick="selectQuizOption(this, 'mood', 'Scary')">
              <span class="quiz-option-icon">👻</span>
              <div class="quiz-option-title">Spooky Thrill</div>
              <div class="quiz-option-desc">Horror & edge-of-seat tension</div>
            </div>
            <div class="quiz-option-card" data-value="Suspenseful" onclick="selectQuizOption(this, 'mood', 'Suspenseful')">
              <span class="quiz-option-icon">😂</span>
              <div class="quiz-option-title">Fun & Lighthearted</div>
              <div class="quiz-option-desc">Laughter, music & joy</div>
            </div>
          </div>
        </div>

        <!-- Step 2: Time of Day -->
        <div class="quiz-step-pane" data-step="2">
          <div class="quiz-options-grid">
            <div class="quiz-option-card selected" data-value="Morning" onclick="selectQuizOption(this, 'timeOfDay', 'Morning')">
              <span class="quiz-option-icon">☀️</span>
              <div class="quiz-option-title">Morning Bright</div>
              <div class="quiz-option-desc">Uplifting start to the day</div>
            </div>
            <div class="quiz-option-card" data-value="Evening" onclick="selectQuizOption(this, 'timeOfDay', 'Evening')">
              <span class="quiz-option-icon">🌇</span>
              <div class="quiz-option-title">Sunset Chill</div>
              <div class="quiz-option-desc">Evening wind-down time</div>
            </div>
            <div class="quiz-option-card" data-value="Night" onclick="selectQuizOption(this, 'timeOfDay', 'Night')">
              <span class="quiz-option-icon">🌙</span>
              <div class="quiz-option-title">Prime Time Binge</div>
              <div class="quiz-option-desc">Peak night viewing</div>
            </div>
            <div class="quiz-option-card" data-value="Midnight" onclick="selectQuizOption(this, 'timeOfDay', 'Midnight')">
              <span class="quiz-option-icon">🌌</span>
              <div class="quiz-option-title">Midnight Mystery</div>
              <div class="quiz-option-desc">Late night dark atmosphere</div>
            </div>
          </div>
        </div>

        <!-- Step 3: Company -->
        <div class="quiz-step-pane" data-step="3">
          <div class="quiz-options-grid">
            <div class="quiz-option-card selected" data-value="Solo" onclick="selectQuizOption(this, 'company', 'Solo')">
              <span class="quiz-option-icon">👤</span>
              <div class="quiz-option-title">Solo Viewing</div>
              <div class="quiz-option-desc">Just me, my snacks & cinema</div>
            </div>
            <div class="quiz-option-card" data-value="Date" onclick="selectQuizOption(this, 'company', 'Date')">
              <span class="quiz-option-icon">👫</span>
              <div class="quiz-option-title">Date Night</div>
              <div class="quiz-option-desc">Romantic or engaging pick</div>
            </div>
            <div class="quiz-option-card" data-value="Family" onclick="selectQuizOption(this, 'company', 'Family')">
              <span class="quiz-option-icon">👨‍👩‍👧</span>
              <div class="quiz-option-title">Family Night</div>
              <div class="quiz-option-desc">Crowd pleaser for everyone</div>
            </div>
            <div class="quiz-option-card" data-value="Friends" onclick="selectQuizOption(this, 'company', 'Friends')">
              <span class="quiz-option-icon">🍻</span>
              <div class="quiz-option-title">Squad / Friends</div>
              <div class="quiz-option-desc">Fun & high energy vibes</div>
            </div>
          </div>
        </div>

        <!-- Step 4: Duration -->
        <div class="quiz-step-pane" data-step="4">
          <div class="quiz-options-grid">
            <div class="quiz-option-card" data-value="90" onclick="selectQuizOption(this, 'duration', 90)">
              <span class="quiz-option-icon">⚡</span>
              <div class="quiz-option-title">Quick Watch (&lt; 90 min)</div>
              <div class="quiz-option-desc">Snappy story, no fluff</div>
            </div>
            <div class="quiz-option-card selected" data-value="130" onclick="selectQuizOption(this, 'duration', 130)">
              <span class="quiz-option-icon">🎬</span>
              <div class="quiz-option-title">Standard Feature (~ 2 hours)</div>
              <div class="quiz-option-desc">Classic movie duration</div>
            </div>
            <div class="quiz-option-card" data-value="999" onclick="selectQuizOption(this, 'duration', 999)">
              <span class="quiz-option-icon">🍿</span>
              <div class="quiz-option-title">Cinematic Epic (2.5h+)</div>
              <div class="quiz-option-desc">Deep immersion experience</div>
            </div>
          </div>
        </div>

        <!-- Step 5: Result Pane -->
        <div class="quiz-step-pane" data-step="5" id="quiz-result-pane">
          <!-- Populated dynamically -->
        </div>
      </div>

      <div class="quiz-modal-footer">
        <button class="btn btn-outline quiz-nav-btn" id="quiz-prev-btn" style="visibility: hidden;" onclick="navigateQuizStep(-1)">
          <i class="fa-solid fa-arrow-left"></i> Back
        </button>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button class="btn btn-outline quiz-nav-btn" id="quiz-skip-btn" onclick="closeMoodQuizModal()">Skip</button>
          <button class="btn btn-primary quiz-nav-btn" id="quiz-next-btn" onclick="navigateQuizStep(1)">
            Next <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(moodQuizModal);

  const closeBtn = moodQuizModal.querySelector("#close-quiz-btn");
  closeBtn.addEventListener("click", closeMoodQuizModal);
  moodQuizModal.addEventListener("click", (e) => {
    if (e.target === moodQuizModal) closeMoodQuizModal();
  });

  // Auto show on every visit / refresh on index.html (landing page)
  const isHomePage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === "" ||
    window.location.pathname.endsWith("/cineplay/") ||
    window.location.pathname.endsWith("/cineplay/index.html");

  if (isHomePage) {
    setTimeout(() => {
      openMoodQuizModal();
    }, 600);
  }
}

function openMoodQuizModal() {
  initMoodQuizModal();
  currentQuizStep = 1;
  updateQuizUI();
  moodQuizModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMoodQuizModal() {
  if (!moodQuizModal) return;
  moodQuizModal.classList.remove("active");
  document.body.style.overflow = "";
}

window.selectQuizOption = function (card, key, val) {
  const parentPane = card.closest(".quiz-step-pane");
  parentPane.querySelectorAll(".quiz-option-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  quizSelections[key] = val;
};

window.navigateQuizStep = function (direction) {
  currentQuizStep += direction;
  if (currentQuizStep > 4 && direction > 0) {
    calculateQuizResults();
  } else if (currentQuizStep < 1) {
    currentQuizStep = 1;
    updateQuizUI();
  } else {
    updateQuizUI();
  }
};

function updateQuizUI() {
  const tag = document.getElementById("quiz-step-tag");
  const title = document.getElementById("quiz-question-title");
  const subtitle = document.getElementById("quiz-question-subtitle");
  const progressBar = document.getElementById("quiz-progress-bar");
  const prevBtn = document.getElementById("quiz-prev-btn");
  const nextBtn = document.getElementById("quiz-next-btn");
  const skipBtn = document.getElementById("quiz-skip-btn");

  if (!tag || !title) return;

  const stepPanes = moodQuizModal.querySelectorAll(".quiz-step-pane");
  stepPanes.forEach(pane => {
    pane.classList.toggle("active", parseInt(pane.dataset.step, 10) === currentQuizStep);
  });

  if (currentQuizStep === 5) {
    prevBtn.style.visibility = "visible";
    prevBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Retake';
    prevBtn.onclick = () => { currentQuizStep = 1; updateQuizUI(); };
    skipBtn.style.display = "none";
    nextBtn.style.display = "inline-flex";
    nextBtn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
    nextBtn.onclick = closeMoodQuizModal;
    return;
  }

  // Restore regular onclick for steps 1-4
  prevBtn.onclick = () => navigateQuizStep(-1);
  nextBtn.onclick = () => navigateQuizStep(1);
  nextBtn.style.display = "inline-flex";
  prevBtn.style.visibility = currentQuizStep > 1 ? "visible" : "hidden";
  skipBtn.style.display = "inline-block";

  if (currentQuizStep === 1) {
    tag.textContent = "Step 1 of 4 • Mood";
    title.textContent = "How are you feeling right now?";
    subtitle.textContent = "Select your vibe and let CinePlay recommend the perfect movie.";
    progressBar.style.width = "25%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
  } else if (currentQuizStep === 2) {
    tag.textContent = "Step 2 of 4 • Time of Day";
    title.textContent = "What is the time of day?";
    subtitle.textContent = "We adjust recommendations based on your viewing environment.";
    progressBar.style.width = "50%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
  } else if (currentQuizStep === 3) {
    tag.textContent = "Step 3 of 4 • Watch Partner";
    title.textContent = "Who are you watching with?";
    subtitle.textContent = "Solo relaxation, date night, or family movie session?";
    progressBar.style.width = "75%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
  } else if (currentQuizStep === 4) {
    tag.textContent = "Step 4 of 4 • Time Limit";
    title.textContent = "How much time do you have?";
    subtitle.textContent = "Pick your ideal duration to prevent late night fatigue.";
    progressBar.style.width = "100%";
    nextBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Get My Match';
    prevBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back';
  }
}

function calculateQuizResults() {
  const resultPane = document.getElementById("quiz-result-pane");
  const tag = document.getElementById("quiz-step-tag");
  const title = document.getElementById("quiz-question-title");
  const subtitle = document.getElementById("quiz-question-subtitle");

  currentQuizStep = 5;
  tag.textContent = "Your Perfect Cinema Match";
  title.textContent = "No More Scrolling!";
  subtitle.textContent = `Based on your ${quizSelections.mood} vibe, ${quizSelections.timeOfDay.toLowerCase()} timing, and ${quizSelections.company.toLowerCase()} plan:`;

  const matches = CinePlay.getRecommendations({
    contentType: "movie",
    mood: quizSelections.mood,
    runtimeMax: quizSelections.duration
  });

  const topMatch = matches.length > 0 ? matches[0].item : window.moviesData[0];
  const score = matches.length > 0 ? matches[0].score : 96;

  resultPane.innerHTML = `
    <div class="quiz-result-hero">
      <img src="${topMatch.poster}" alt="${topMatch.title}" class="quiz-result-poster">
      <div class="quiz-result-info">
        <span class="match-score-chip"><i class="fa-solid fa-bolt"></i> ${score}% Match</span>
        <span class="match-rationale-tag">Perfect for ${quizSelections.company} • ${quizSelections.timeOfDay}</span>
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary);">${topMatch.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${topMatch.description}</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${topMatch.trailer ? `<button class="btn btn-primary" style="padding: 8px 16px; font-size: 12px;" onclick="CinePlay.openTrailerModal('${topMatch.trailer}', '${topMatch.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-play"></i> Watch Trailer</button>` : ''}
          <button class="btn btn-outline" style="padding: 8px 16px; font-size: 12px;" onclick="CinePlay.openDetailsModal(window.moviesData.find(m => m.id === '${topMatch.id}'), 'movie')"><i class="fa-solid fa-circle-info"></i> Full Details</button>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px;">
      <a href="recommendations.html" class="btn btn-primary btn-large" style="width: 100%; border-radius: 30px; padding: 12px 20px; font-size: 14px;" onclick="closeMoodQuizModal()">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Explore All Matches on Recommendation Engine
      </a>
    </div>
  `;

  updateQuizUI();
}

/* ==========================================================================
   8. Floating Quick Match Button Trigger
   ========================================================================== */
function initFloatingMatchBtn() {
  if (document.getElementById("floating-match-btn")) return;
  const btn = document.createElement("button");
  btn.id = "floating-match-btn";
  btn.className = "floating-match-btn";
  btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Quick Mood Match</span>`;
  btn.addEventListener("click", () => {
    openMoodQuizModal();
  });
  document.body.appendChild(btn);
}

/* ==========================================================================
   9. Live Search Auto-Suggestions Dropdown
   ========================================================================== */
function initLiveSearchAutoSuggestions() {
  const searchInputs = document.querySelectorAll(".search-input");

  searchInputs.forEach(input => {
    const wrapper = input.closest(".search-input-wrapper");
    if (!wrapper) return;

    let dropdown = wrapper.querySelector(".search-suggestions-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-suggestions-dropdown";
      wrapper.appendChild(dropdown);
    }

    let searchTimer = null;

    input.addEventListener("input", () => {
      clearTimeout(searchTimer);
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        dropdown.classList.remove("active");
        return;
      }

      searchTimer = setTimeout(async () => {
        let matches = [];

        // 1. Check local dataset
        const localMovies = (window.moviesData || []).filter(m => m.title.toLowerCase().includes(q)).map(m => ({ ...m, type: "movie" }));
        const localGames = (window.gamesData || []).filter(g => g.title.toLowerCase().includes(q)).map(g => ({ ...g, type: "game" }));
        matches = [...localMovies, ...localGames];

        // 2. Fetch live TMDB results if API service is available
        if (window.CinePlayAPIService) {
          try {
            const tmdbRes = await window.CinePlayAPIService.searchTMDBMovies(q);
            if (tmdbRes && tmdbRes.results && tmdbRes.results.length > 0) {
              const tmdbMatches = tmdbRes.results.slice(0, 4).map(m => window.CinePlayAPIService.normalizeMovie(m));
              tmdbMatches.forEach(tm => {
                if (!matches.some(item => item.title.toLowerCase() === tm.title.toLowerCase())) {
                  matches.push(tm);
                }
              });
            }
          } catch (e) {
            console.warn("Live search TMDB fetch error:", e);
          }
        }

        if (matches.length === 0) {
          dropdown.classList.remove("active");
          return;
        }

        dropdown.innerHTML = matches.slice(0, 6).map(item => {
          const safeTitle = (item.title || item.name || "Untitled").replace(/'/g, "\\'");
          const thumb = item.poster || item.cover || "images/posters/m1.jpg";
          const rating = item.rating || item.tmdbRating || 8.0;
          const year = item.year || 2024;
          const type = item.type || "movie";

          return `
            <div class="suggestion-item" onclick="CinePlay.openDetailsModal(${JSON.stringify(item).replace(/"/g, '&quot;')}, '${type}'); this.parentElement.classList.remove('active'); document.querySelectorAll('.search-input').forEach(i => i.blur());">
              <img src="${thumb}" alt="${safeTitle}" class="suggestion-thumb" onerror="this.src='images/posters/m1.jpg'">
              <div>
                <div class="suggestion-title">${item.title || item.name}</div>
                <div class="suggestion-meta"><i class="fa-solid fa-star" style="color: var(--rating-yellow);"></i> ${rating} • ${year} • <span style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: var(--accent-red);">${type}</span></div>
              </div>
            </div>
          `;
        }).join("");

        dropdown.classList.add("active");
      }, 250);
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dropdown.classList.remove("active");
        input.blur();
        return;
      }

      if (e.key === "Enter") {
        if (dropdown.classList.contains("active")) {
          const firstSuggestion = dropdown.querySelector(".suggestion-item");
          if (firstSuggestion) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.remove("active");
            input.blur();
            firstSuggestion.click();
          }
        }
      }
    });
  });
}

/* ==========================================================================
   10. Recently Viewed Tracking
   ========================================================================== */
const RECENTLY_VIEWED_KEY = "cineplay_recently_viewed";

function getRecentlyViewed() {
  return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
}

function trackRecentlyViewed(id, type) {
  let list = getRecentlyViewed();
  list = list.filter(item => item.id !== id);
  list.unshift({ id, type });
  if (list.length > 6) {
    list.pop();
  }
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("recentlyViewedChanged"));
}

/* ==========================================================================
   11. Theme / Sticky Header / Mobile Menu UI
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme === "light" ? "Light" : "Dark"} Mode`, "fa-circle-half-stroke");
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#theme-toggle i");
  if (!icon) return;
  icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
}

function initNavbar() {
  const header = document.querySelector("header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("sticky", window.scrollY > 50);
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");
  if (!menuBtn || !navMenu) return;

  let overlay = document.querySelector(".mobile-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    navMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    const icon = menuBtn.querySelector("i");
    icon.className = navMenu.classList.contains("active") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  }

  menuBtn.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu.classList.contains("active")) toggleMenu();
    });
  });
}

function initBackToTop() {
  let backBtn = document.getElementById("back-to-top");
  if (!backBtn) {
    backBtn = document.createElement("button");
    backBtn.id = "back-to-top";
    backBtn.className = "back-to-top";
    backBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backBtn);
  }

  window.addEventListener("scroll", () => {
    backBtn.classList.toggle("show", window.scrollY > 400);
  });

  backBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================================================
   12. Stats & Skeletons Observer helpers
   ========================================================================== */
function initLazyLoading() {
  const images = document.querySelectorAll("img[loading='lazy']");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => observer.observe(img));
  } else {
    images.forEach(img => { if (img.dataset.src) img.src = img.dataset.src; });
  }
}

function initIntersectionObserver() {
  const revealElements = document.querySelectorAll(".scroll-reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("active"));
  }

  const counters = document.querySelectorAll(".stat-number");
  if (counters.length > 0 && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  } else {
    counters.forEach(c => {
      c.textContent = parseInt(c.dataset.target, 10).toLocaleString() + (c.dataset.suffix || "");
    });
  }
}

function animateCounters(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 2000;
  const stepTime = Math.max(Math.floor(duration / target), 15);
  let current = 0;
  const increment = Math.ceil(target / (duration / stepTime));

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target.toLocaleString() + suffix;
      clearInterval(timer);
    } else {
      el.textContent = current.toLocaleString() + suffix;
    }
  }, stepTime);
}

function showToast(message, iconClass = "fa-info-circle") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => {
      toast.remove();
      if (container.children.length === 0) container.remove();
    });
  }, 3000);
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector(".newsletter-input");
    if (input && input.value.trim()) {
      showToast("Subscription successful! Welcome aboard.", "fa-paper-plane");
      input.value = "";
    }
  });
}

/* ==========================================================================
   13. Decoupled Home Page Feature Initializer
   ========================================================================== */
function initHomePage() {
  initHeroSlider();
  initHomeSearch();
  renderFeaturedLists();
}

function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");
  if (!slides.length || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentSlide = 0;
  let slideInterval;

  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
    dot.addEventListener("click", () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".dot");

  function updateSlides() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentSlide);
      if (dots[idx]) dots[idx].classList.toggle("active", idx === currentSlide);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
  }

  function goToSlide(idx) {
    currentSlide = idx;
    updateSlides();
    resetTimer();
  }

  function startTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 6000);
  }

  function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
  }

  prevBtn.addEventListener("click", () => { prevSlide(); resetTimer(); });
  nextBtn.addEventListener("click", () => { nextSlide(); resetTimer(); });
  startTimer();
}

function initHomeSearch() {
  const form = document.getElementById("home-search-form");
  const input = document.getElementById("home-search-input");
  const typeSelect = document.getElementById("search-type");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = encodeURIComponent(input.value.trim());
    const type = typeSelect.value;
    if (value) {
      window.location.href = `${type}.html?search=${value}`;
    }
  });
}

async function renderFeaturedLists() {
  const moviesSlider = document.getElementById("featured-movies-slider");
  const gamesSlider = document.getElementById("featured-games-slider");
  if (!moviesSlider || !gamesSlider) return;

  try {
    // ✅ Fetch movies with better error handling
    let movieRes = null;
    try {
      movieRes = await CinePlayAPI.fetchMovies({ sortBy: "rating-desc", limit: 6 });
      console.log("🎬 Featured Movies:", movieRes?.results?.length || 0);
    } catch (e) {
      console.warn("Movies fetch failed:", e);
    }

    // ✅ Fetch games with better error handling
    let gameRes = null;
    try {
      gameRes = await CinePlayAPI.fetchGames({ sortBy: "rating-desc", limit: 6 });
      console.log("🎮 Featured Games:", gameRes?.results?.length || 0);
    } catch (e) {
      console.warn("Games fetch failed:", e);
    }

    // ✅ If API fails, use local data as fallback
    if (!movieRes || !movieRes.results || movieRes.results.length === 0) {
      console.warn("Using local movies for featured section");
      let localMovies = [...(window.moviesData || [])];
      localMovies.sort((a, b) => b.rating - a.rating);
      movieRes = { results: localMovies.slice(0, 6), total: localMovies.length, hasMore: false };
    }

    if (!gameRes || !gameRes.results || gameRes.results.length === 0) {
      console.warn("Using local games for featured section");
      let localGames = [...(window.gamesData || [])];
      localGames.sort((a, b) => b.rating - a.rating);
      gameRes = { results: localGames.slice(0, 6), total: localGames.length, hasMore: false };
    }

    // ✅ Render movies
    if (movieRes && movieRes.results && movieRes.results.length > 0) {
      window.CinePlay.renderMovies(movieRes.results, moviesSlider);
      console.log("✅ Featured movies rendered:", movieRes.results.length);
    } else {
      console.warn("No movies to render");
      moviesSlider.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No movies available</div>`;
    }

    // ✅ Render games
    if (gameRes && gameRes.results && gameRes.results.length > 0) {
      window.CinePlay.renderGames(gameRes.results, gamesSlider);
      console.log("✅ Featured games rendered:", gameRes.results.length);
    } else {
      console.warn("No games to render");
      gamesSlider.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No games available</div>`;
    }

    // Sync favorites indicators on cards
    window.addEventListener("favoritesChanged", () => {
      syncFavoritesIcons(moviesSlider);
      syncFavoritesIcons(gamesSlider);
    });

  } catch (error) {
    console.error("Error rendering featured lists:", error);
    // Fallback: try to render from local data
    try {
      if (window.moviesData && window.moviesData.length > 0) {
        const sorted = [...window.moviesData].sort((a, b) => b.rating - a.rating);
        window.CinePlay.renderMovies(sorted.slice(0, 6), moviesSlider);
      }
      if (window.gamesData && window.gamesData.length > 0) {
        const sorted = [...window.gamesData].sort((a, b) => b.rating - a.rating);
        window.CinePlay.renderGames(sorted.slice(0, 6), gamesSlider);
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
  }
}

function syncFavoritesIcons(container) {
  if (!container) return;
  const cards = container.querySelectorAll(".media-card");
  cards.forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector(".card-favorite-btn");
    if (!btn) return;
    const isFav = isFavorite(id);
    btn.classList.toggle("active", isFav);
    const icon = btn.querySelector("i");
    if (icon) icon.className = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });
}

/* ==========================================================================
   Universal Search Overlay Engine
   ========================================================================== */
function initUniversalSearch() {
  let searchOverlay = document.getElementById("universal-search-overlay");
  if (!searchOverlay) {
    searchOverlay = document.createElement("div");
    searchOverlay.id = "universal-search-overlay";
    searchOverlay.className = "search-overlay";
    searchOverlay.innerHTML = `
      <div class="search-overlay-header">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 24px; color: var(--accent-red);"></i>
        <input type="text" id="universal-search-input" class="search-overlay-input" placeholder="Search CinePlay movies, games, actors, directors..." autocomplete="off">
        <button class="search-overlay-close" id="universal-search-close" aria-label="Close Search"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="search-overlay-results" id="universal-search-results">
        <div style="text-align: center; color: var(--text-muted); margin-top: 40px;">
          <i class="fa-solid fa-clapperboard" style="font-size: 40px; margin-bottom: 10px; color: var(--accent-red);"></i>
          <p>Type to search across movies, games, actors, and directors...</p>
        </div>
      </div>
    `;
    document.body.appendChild(searchOverlay);
  }

  const closeBtn = document.getElementById("universal-search-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => searchOverlay.classList.remove("active"));
  }

  // Keyboard shortcut Ctrl+K or / to open
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openUniversalSearch();
    } else if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
      searchOverlay.classList.remove("active");
    }
  });

  const input = document.getElementById("universal-search-input");
  if (input) {
    input.addEventListener("input", (e) => handleUniversalSearch(e.target.value));
  }
}

function openUniversalSearch(initialQuery = "") {
  initUniversalSearch();
  const searchOverlay = document.getElementById("universal-search-overlay");
  const input = document.getElementById("universal-search-input");
  if (searchOverlay && input) {
    searchOverlay.classList.add("active");
    input.value = initialQuery;
    input.focus();
    if (initialQuery) handleUniversalSearch(initialQuery);
  }
}

function handleUniversalSearch(query) {
  const container = document.getElementById("universal-search-results");
  if (!container) return;
  const q = query.toLowerCase().trim();

  if (!q) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 40px;">
        <i class="fa-solid fa-clapperboard" style="font-size: 40px; margin-bottom: 10px; color: var(--accent-red);"></i>
        <p>Type to search across movies, games, actors, and directors...</p>
      </div>
    `;
    return;
  }

  const movies = (window.moviesData || []).filter(m => m.title.toLowerCase().includes(q) || (m.genre && m.genre.some(g => g.toLowerCase().includes(q))));
  const games = (window.gamesData || []).filter(g => g.title.toLowerCase().includes(q) || (g.genre && g.genre.some(gen => gen.toLowerCase().includes(q))));
  const actors = (window.actorsData || []).filter(a => a.name.toLowerCase().includes(q) || a.knownFor.toLowerCase().includes(q));
  const directors = (window.directorsData || []).filter(d => d.name.toLowerCase().includes(q) || d.knownFor.toLowerCase().includes(q));

  if (movies.length === 0 && games.length === 0 && actors.length === 0 && directors.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 40px;">
        <i class="fa-solid fa-ghost" style="font-size: 40px; margin-bottom: 10px; color: var(--accent-red);"></i>
        <h3>No matching results found</h3>
        <p style="font-size: 13px;">Try searching for a different keyword, title, actor, or genre.</p>
      </div>
    `;
    return;
  }

  let html = "";

  if (movies.length > 0) {
    html += `
      <div class="search-category-group">
        <h4><i class="fa-solid fa-film"></i> Movies (${movies.length})</h4>
        <div class="search-results-grid">
          ${movies.slice(0, 6).map(m => `
            <div class="search-result-card" onclick="CinePlay.openDetailsModal(window.moviesData.find(x => x.id === '${m.id}'), 'movie'); document.getElementById('universal-search-overlay').classList.remove('active');">
              <img src="${m.poster}" alt="${m.title}" onerror="this.src='images/posters/m1.jpg'">
              <div class="search-result-info">
                <div class="search-result-title">${m.title}</div>
                <div class="search-result-sub">⭐ ${m.rating} • ${m.year} • ${m.genre ? m.genre[0] : ''}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (games.length > 0) {
    html += `
      <div class="search-category-group">
        <h4><i class="fa-solid fa-gamepad"></i> Games (${games.length})</h4>
        <div class="search-results-grid">
          ${games.slice(0, 6).map(g => `
            <div class="search-result-card" onclick="CinePlay.openDetailsModal(window.gamesData.find(x => x.id === '${g.id}'), 'game'); document.getElementById('universal-search-overlay').classList.remove('active');">
              <img src="${g.cover}" alt="${g.title}" onerror="this.src='images/posters/g1.jpg'">
              <div class="search-result-info">
                <div class="search-result-title">${g.title}</div>
                <div class="search-result-sub">⭐ ${g.rating} • ${g.year} • ${g.price || 'Free'}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (actors.length > 0) {
    html += `
      <div class="search-category-group">
        <h4><i class="fa-solid fa-user-astronaut"></i> People / Cast (${actors.length})</h4>
        <div class="search-results-grid">
          ${actors.map(a => `
            <div class="search-result-card" onclick="window.location.href='movies.html?actor=' + encodeURIComponent('${a.name}')">
              <img src="${a.image}" alt="${a.name}" style="border-radius: 50%;">
              <div class="search-result-info">
                <div class="search-result-title">${a.name}</div>
                <div class="search-result-sub">${a.role} • ${a.knownFor}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (directors.length > 0) {
    html += `
      <div class="search-category-group">
        <h4><i class="fa-solid fa-video"></i> Directors (${directors.length})</h4>
        <div class="search-results-grid">
          ${directors.map(d => `
            <div class="search-result-card" onclick="window.location.href='movies.html?director=' + encodeURIComponent('${d.name}')">
              <img src="${d.image}" alt="${d.name}" style="border-radius: 50%;">
              <div class="search-result-info">
                <div class="search-result-title">${d.name}</div>
                <div class="search-result-sub">Director • ${d.knownFor}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

/* ==========================================================================
   Surprise Me Event Feature
   ========================================================================== */
let _lastSurprisePickId = null;

function triggerSurpriseMe(filterType = "all") {
  // 1. Close ALL UI overlays and dropdowns
  document.querySelectorAll(".search-suggestions-dropdown.active").forEach(d => d.classList.remove("active"));

  // Close universal search overlay
  const universalOverlay = document.getElementById("universal-search-overlay");
  if (universalOverlay) universalOverlay.classList.remove("active");

  // Close filter drawers
  const filterDrawer = document.getElementById("advanced-filter-drawer");
  if (filterDrawer) filterDrawer.style.display = "none";

  const gameDrawer = document.getElementById("advanced-game-filter-drawer");
  if (gameDrawer) gameDrawer.style.display = "none";

  // Close mood quiz
  const moodQuiz = document.getElementById("mood-quiz-modal");
  if (moodQuiz) moodQuiz.classList.remove("active");

  // ✅ Blur any focused input
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }

  // 2. Select dataset
  let pool = [];
  const movies = window.moviesData || [];
  const games = window.gamesData || [];

  if (filterType === "movie") {
    pool = movies;
  } else if (filterType === "game") {
    pool = games;
  } else {
    pool = [...movies, ...games];
  }

  if (pool.length === 0) {
    showToast("Finding something amazing for you...", "fa-dice");
    return;
  }

  let candidates = pool;
  if (pool.length > 1 && _lastSurprisePickId) {
    const filtered = pool.filter(item => item.id !== _lastSurprisePickId);
    if (filtered.length > 0) candidates = filtered;
  }

  const randomPick = candidates[Math.floor(Math.random() * candidates.length)];
  _lastSurprisePickId = randomPick.id;

  const targetType = filterType === "movie" ? "movie" : (filterType === "game" ? "game" : (!randomPick.platform ? "movie" : "game"));

  showToast(`🎲 Tonight's Pick: ${randomPick.title}!`, "fa-dice-d20");

  setTimeout(() => {
    openDetailsModal(randomPick, targetType);
  }, 200);
}

/* ==========================================================================
   Dislike Learner System
   ========================================================================== */
function markAsDisliked(itemId, title) {
  let dislikes = JSON.parse(localStorage.getItem("cineplay_dislikes") || "[]");
  if (!dislikes.includes(itemId)) {
    dislikes.push(itemId);
    localStorage.setItem("cineplay_dislikes", JSON.stringify(dislikes));
  }
  showToast(`Got it. We'll show you fewer recommendations like "${title}".`, "fa-thumbs-down");
}

function renderSkeletonCardsHTML(count = 4) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-box" style="height: 240px;"></div>
      <div class="skeleton-box" style="height: 20px; width: 80%;"></div>
      <div class="skeleton-box" style="height: 14px; width: 60%;"></div>
    </div>
  `).join("");
}

// Global exposes for detail modals in slides or cards
window.openFeaturedItem = function (id) {
  const type = id.startsWith("m") ? "movie" : "game";
  const dataSet = type === "movie" ? window.moviesData : window.gamesData;
  const item = dataSet.find(i => i.id === id);
  if (item) {
    openDetailsModal(item, type);
  }
};

// Unified namespace exports
window.CinePlay = {
  // UI Renderers
  renderMovies,
  renderGames,

  // Data Processors
  searchItems,
  filterByGenre,
  sortItems,
  getRecommendations,

  // Favorites State Hooks
  getFavorites,
  toggleFavorite,
  isFavorite,

  // Modal / Notifications / Trailers
  openDetailsModal,
  closeModal,
  openTrailerModal,
  closeTrailerModal,
  openMoodQuizModal,
  closeMoodQuizModal,
  showToast,
  openUniversalSearch,
  triggerSurpriseMe,
  markAsDisliked,
  renderSkeletonCardsHTML,

  // Fallbacks
  movieImgFallback,
  gameImgFallback,
  handleFavoriteAction,

  // Template HTML Generators
  createMovieCardHTML,
  createGameCardHTML,

  // History Tracker
  getRecentlyViewed,
  trackRecentlyViewed
};

// Expose API Client globally
window.CinePlayAPI = CinePlayAPI;

