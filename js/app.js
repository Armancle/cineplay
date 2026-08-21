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
  initFloatingMatchBtn();
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
const CinePlayAPI = {
  // Simulates an async fetch for movies. Easily swappable for TMDB API endpoints.
  async fetchMovies({ query = "", genre = "All", sortBy = "rating-desc", page = 1, limit = 8 } = {}) {
    await simulateNetworkDelay(250);

    let movies = window.moviesData ? [...window.moviesData] : [];

    if (query) {
      movies = CinePlay.searchItems(movies, query);
    }
    if (genre !== "All") {
      movies = CinePlay.filterByGenre(movies, genre);
    }

    CinePlay.sortItems(movies, sortBy);

    const start = 0;
    const end = page * limit;
    const paginated = movies.slice(start, end);

    return {
      results: paginated,
      total: movies.length,
      hasMore: end < movies.length
    };
  },

  // Simulates an async fetch for games. Easily swappable for RAWG API endpoints.
  async fetchGames({ query = "", genre = "All", platform = "All", sortBy = "rating-desc", page = 1, limit = 8 } = {}) {
    await simulateNetworkDelay(250);

    let games = window.gamesData ? [...window.gamesData] : [];

    if (query) {
      games = CinePlay.searchItems(games, query);
    }
    if (genre !== "All") {
      games = CinePlay.filterByGenre(games, genre);
    }
    if (platform !== "All") {
      games = games.filter(game => game.platform && game.platform.includes(platform));
    }

    CinePlay.sortItems(games, sortBy);

    const start = 0;
    const end = page * limit;
    const paginated = games.slice(start, end);

    return {
      results: paginated,
      total: games.length,
      hasMore: end < games.length
    };
  },

  // Simulates recommendations calculation.
  async fetchRecommendations(criteria) {
    await simulateNetworkDelay(800); // Shimmer delay for matching simulation
    return CinePlay.getRecommendations(criteria);
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

// Recommendations scoring algorithm
function getRecommendations({ contentType = "movie", mood = "Action-packed", genre = "All", era = "any", platform = "any", runtimeMax = 999 }) {
  const dataset = contentType === "movie" ? window.moviesData : window.gamesData;
  if (!dataset) return [];

  const matchedList = dataset.map(item => {
    let score = 0;

    // 1. Mood match (Weight: 40 points)
    if (item.mood && item.mood.includes(mood)) {
      score += 40;
    } else if (item.mood && item.mood.some(m => m.toLowerCase().includes(mood.toLowerCase()))) {
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
function renderMovies(movies, containerElement) {
  if (!containerElement) return;
  if (movies.length === 0) {
    containerElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No movies found matching your criteria.</div>`;
    return;
  }
  containerElement.innerHTML = movies.map(movie => createMovieCardHTML(movie)).join("");
  bindCardClickEvents(containerElement, "movie");
}

// Renders list of game cards into specified container
function renderGames(games, containerElement) {
  if (!containerElement) return;
  if (games.length === 0) {
    containerElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No games found matching your criteria.</div>`;
    return;
  }
  containerElement.innerHTML = games.map(game => createGameCardHTML(game)).join("");
  bindCardClickEvents(containerElement, "game");
}

// Dynamic templates
function createMovieCardHTML(movie) {
  const isFav = isFavorite(movie.id);
  const streamingBadges = movie.streaming ? movie.streaming.slice(0, 2).map(s => `<span class="streaming-badge">${s}</span>`).join("") : "";

  return `
    <article class="media-card" data-id="${movie.id}" data-type="movie">
      <div class="card-img-wrapper shimmer-wrapper">
        <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy" onerror="CinePlay.movieImgFallback(this, '${movie.title}')">
        <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${movie.rating}</div>
        <button class="card-favorite-btn ${isFav ? 'active' : ''}" aria-label="Favorite button" onclick="event.stopPropagation(); CinePlay.handleFavoriteAction(this, '${movie.id}', 'movie')">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        <span class="card-type-tag">Movie</span>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span>${movie.year}</span>
          <span>${movie.runtime} mins</span>
        </div>
        <h3 class="card-title">${movie.title}</h3>
        <div class="card-genres">
          ${movie.genre.slice(0, 3).map(g => `<span class="card-genre-tag">${g}</span>`).join("")}
        </div>
        <p class="card-desc">${movie.description}</p>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="card-btn" style="flex: 1;">Details</button>
          ${movie.trailer ? `<button class="card-btn btn-outline" style="padding: 0 12px; border-radius: 8px;" title="Watch Trailer" onclick="event.stopPropagation(); CinePlay.openTrailerModal('${movie.trailer}', '${movie.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-play"></i></button>` : ''}
        </div>
        ${streamingBadges ? `<div class="streaming-list">${streamingBadges}</div>` : ''}
      </div>
    </article>
  `;
}

function createGameCardHTML(game) {
  const isFav = isFavorite(game.id);
  return `
    <article class="media-card" data-id="${game.id}" data-type="game">
      <div class="card-img-wrapper shimmer-wrapper">
        <img src="${game.cover}" alt="${game.title}" class="card-img" loading="lazy" onerror="CinePlay.gameImgFallback(this, '${game.title}')">
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
            ${game.platform.slice(0, 2).join(", ")}${game.platform.length > 2 ? '...' : ''}
          </span>
        </div>
        <h3 class="card-title">${game.title}</h3>
        <div class="card-genres">
          ${game.genre.slice(0, 3).map(g => `<span class="card-genre-tag">${g}</span>`).join("")}
        </div>
        <p class="card-desc">${game.description}</p>
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
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const dataSet = type === "movie" ? window.moviesData : window.gamesData;
      const item = dataSet.find(i => i.id === id);
      if (item) {
        openDetailsModal(item, type);
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

  const posterContainer = document.getElementById("modal-poster-container");
  const titleText = document.getElementById("modal-title-text");
  const badgesContainer = document.getElementById("modal-badges-container");
  const descText = document.getElementById("modal-desc-text");
  const infoDetails = document.getElementById("modal-info-details");
  const actionsContainer = document.getElementById("modal-actions-container");

  posterContainer.innerHTML = "";
  const img = document.createElement("img");
  img.src = type === "movie" ? item.poster : item.cover;
  img.alt = item.title;
  img.onerror = () => {
    posterContainer.innerHTML = `
      <div class="fallback-poster" style="height: 100%;">
        <i class="fa-solid ${type === 'movie' ? 'fa-film' : 'fa-gamepad'}"></i>
        <div class="fallback-title">${item.title}</div>
      </div>
    `;
  };
  posterContainer.appendChild(img);

  titleText.textContent = item.title;

  badgesContainer.innerHTML = `
    <div class="modal-badge rating"><i class="fa-solid fa-star"></i> ${item.rating}</div>
    <div class="modal-badge">${item.year}</div>
    ${type === "movie" ? `<div class="modal-badge"><i class="fa-regular fa-clock"></i> ${item.runtime}m</div>` : ""}
    <div class="modal-badge" style="text-transform: uppercase; background: rgba(229, 9, 20, 0.2); color: #fff;">${type}</div>
  `;

  descText.textContent = item.description;

  let metaHtml = `
    <li><strong>Genres:</strong> ${item.genre.join(", ")}</li>
    <li><strong>Mood Vibe:</strong> ${item.mood ? item.mood.join(" • ") : "N/A"}</li>
  `;
  if (type === "movie") {
    if (item.director) metaHtml += `<li><strong>Director:</strong> ${item.director}</li>`;
    if (item.cast) metaHtml += `<li><strong>Cast:</strong> ${item.cast}</li>`;
    if (item.streaming) {
      metaHtml += `<li><strong>Watch On:</strong> <span class="streaming-list">${item.streaming.map(s => `<span class="streaming-badge">${s}</span>`).join("")}</span></li>`;
    }
  } else if (type === "game") {
    metaHtml += `<li><strong>Platforms:</strong> ${item.platform.join(", ")}</li>`;
    if (item.developer) metaHtml += `<li><strong>Developer:</strong> ${item.developer}</li>`;
  }
  infoDetails.innerHTML = metaHtml;

  const isFav = isFavorite(item.id);
  actionsContainer.innerHTML = `
    ${item.trailer ? `
      <button class="btn btn-primary" id="modal-play-btn">
        <i class="fa-solid fa-play"></i> Watch Trailer
      </button>
    ` : ''}
    <button class="btn btn-outline" id="modal-fav-btn">
      <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      ${isFav ? 'Favorited' : 'Add to Watchlist'}
    </button>
  `;

  const playBtn = document.getElementById("modal-play-btn");
  if (playBtn && item.trailer) {
    playBtn.addEventListener("click", () => {
      openTrailerModal(item.trailer, item.title);
    });
  }

  const favBtn = document.getElementById("modal-fav-btn");
  favBtn.addEventListener("click", () => {
    const isNowFav = toggleFavorite(item.id, type);
    const favIcon = favBtn.querySelector("i");
    if (isNowFav) {
      favIcon.className = "fa-solid fa-heart";
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    } else {
      favIcon.className = "fa-regular fa-heart";
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Watchlist';
    }
  });

  globalModal.classList.add("active");
  document.body.style.overflow = "hidden";
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
        <div style="display: flex; gap: 10px;">
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

  // Auto show on first visit of session on index.html
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
    if (!sessionStorage.getItem("cineplay_quiz_done")) {
      setTimeout(() => {
        openMoodQuizModal();
      }, 1000);
    }
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
  sessionStorage.setItem("cineplay_quiz_done", "true");
  moodQuizModal.classList.remove("active");
  document.body.style.overflow = "";
}

window.selectQuizOption = function(card, key, val) {
  const parentPane = card.closest(".quiz-step-pane");
  parentPane.querySelectorAll(".quiz-option-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  quizSelections[key] = val;
};

window.navigateQuizStep = function(direction) {
  currentQuizStep += direction;
  if (currentQuizStep > 4 && direction > 0) {
    calculateQuizResults();
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

  const stepPanes = moodQuizModal.querySelectorAll(".quiz-step-pane");
  stepPanes.forEach(pane => {
    pane.classList.toggle("active", parseInt(pane.dataset.step, 10) === currentQuizStep);
  });

  prevBtn.style.visibility = currentQuizStep > 1 ? "visible" : "hidden";
  skipBtn.style.display = currentQuizStep === 5 ? "none" : "inline-block";

  if (currentQuizStep === 1) {
    tag.textContent = "Step 1 of 4 • Mood";
    title.textContent = "How are you feeling right now?";
    subtitle.textContent = "Select your vibe and let CinePlay recommend the perfect movie.";
    progressBar.style.width = "25%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
  } else if (currentQuizStep === 2) {
    tag.textContent = "Step 2 of 4 • Time of Day";
    title.textContent = "What is the time of day?";
    subtitle.textContent = "We adjust recommendations based on your viewing environment.";
    progressBar.style.width = "50%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
  } else if (currentQuizStep === 3) {
    tag.textContent = "Step 3 of 4 • Watch Partner";
    title.textContent = "Who are you watching with?";
    subtitle.textContent = "Solo relaxation, date night, or family movie session?";
    progressBar.style.width = "75%";
    nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
  } else if (currentQuizStep === 4) {
    tag.textContent = "Step 4 of 4 • Time Limit";
    title.textContent = "How much time do you have?";
    subtitle.textContent = "Pick your ideal duration to prevent late night fatigue.";
    progressBar.style.width = "100%";
    nextBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Get My Match';
  }
}

function calculateQuizResults() {
  const resultPane = document.getElementById("quiz-result-pane");
  const tag = document.getElementById("quiz-step-tag");
  const title = document.getElementById("quiz-question-title");
  const subtitle = document.getElementById("quiz-question-subtitle");
  const nextBtn = document.getElementById("quiz-next-btn");

  currentQuizStep = 5;
  tag.textContent = "Your Perfect Cinema Match";
  title.textContent = "No More Scrolling!";
  subtitle.textContent = `Based on your ${quizSelections.mood} vibe, ${quizSelections.timeOfDay.toLowerCase()} timing, and ${quizSelections.company.toLowerCase()} plan:`;
  nextBtn.style.display = "none";

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
        <span class="match-rationale-tag">Perfect for ${quizSelections.company} ${quizSelections.timeOfDay}</span>
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 6px;">${topMatch.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${topMatch.description}</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${topMatch.trailer ? `<button class="btn btn-primary" onclick="CinePlay.openTrailerModal('${topMatch.trailer}', '${topMatch.title.replace(/'/g, "\\'")}')"><i class="fa-solid fa-play"></i> Watch Trailer</button>` : ''}
          <button class="btn btn-outline" onclick="CinePlay.openDetailsModal(window.moviesData.find(m => m.id === '${topMatch.id}'), 'movie')"><i class="fa-solid fa-circle-info"></i> Full Details</button>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="recommendations.html" class="btn btn-primary btn-large" style="width: 100%; border-radius: 30px;" onclick="closeMoodQuizModal()">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Explore All Matches on Recommendation Engine
      </a>
    </div>
  `;

  document.querySelectorAll(".quiz-step-pane").forEach(pane => pane.classList.remove("active"));
  resultPane.classList.add("active");
  sessionStorage.setItem("cineplay_quiz_done", "true");
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

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        dropdown.classList.remove("active");
        return;
      }

      const allItems = [
        ...window.moviesData.map(m => ({ ...m, type: "movie" })),
        ...window.gamesData.map(g => ({ ...g, type: "game" }))
      ];

      const matches = allItems.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.genre && item.genre.some(g => g.toLowerCase().includes(q)))
      ).slice(0, 5);

      if (matches.length === 0) {
        dropdown.classList.remove("active");
        return;
      }

      dropdown.innerHTML = matches.map(item => `
        <div class="suggestion-item" onclick="CinePlay.openFeaturedItem('${item.id}'); this.parentElement.classList.remove('active');">
          <img src="${item.poster || item.cover}" alt="${item.title}" class="suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=100&auto=format&fit=crop'">
          <div>
            <div class="suggestion-title">${item.title}</div>
            <div class="suggestion-meta"><i class="fa-solid fa-star" style="color: var(--rating-yellow);"></i> ${item.rating} • ${item.year} • <span style="text-transform: capitalize;">${item.type}</span></div>
          </div>
        </div>
      `).join("");

      dropdown.classList.add("active");
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove("active");
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
    slideInterval = setInterval(6000);
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

  // Retrieve data from decoupling APIs
  const movieRes = await CinePlayAPI.fetchMovies({ sortBy: "rating-desc", limit: 6 });
  const gameRes = await CinePlayAPI.fetchGames({ sortBy: "rating-desc", limit: 6 });

  renderMovies(movieRes.results, moviesSlider);
  renderGames(gameRes.results, gamesSlider);

  // Sync favorites indicators on cards
  window.addEventListener("favoritesChanged", () => {
    syncFavoritesIcons(moviesSlider);
    syncFavoritesIcons(gamesSlider);
  });
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

// Global exposes for detail modals in slides or cards
window.openFeaturedItem = function(id) {
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
