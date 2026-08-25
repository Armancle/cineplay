/* CinePlay - Global Application Script */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();
  initBackToTop();
  initMobileMenu();
  initLazyLoading();
  initIntersectionObserver();
  initNewsletter();
  
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
    await simulateNetworkDelay(1200); // Shimmer delay for matching simulation
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
    (item.genre && item.genre.some(g => g.toLowerCase().includes(q)))
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
function getRecommendations({ contentType, mood, genre, era, platform = "any" }) {
  const dataset = contentType === "movie" ? window.moviesData : window.gamesData;
  if (!dataset) return [];

  const matchedList = dataset.map(item => {
    let score = 0;

    // 1. Mood match (Weight: 40 points)
    if (item.mood && item.mood.includes(mood)) {
      score += 40;
    }

    // 2. Genre match (Weight: 30 points)
    if (item.genre && item.genre.includes(genre)) {
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

    // 4. Platform Match (Only for Games) (Weight: 10 points)
    if (contentType === "game") {
      let platformMatch = false;
      if (platform === "any" || (item.platform && item.platform.includes(platform))) {
        platformMatch = true;
      }
      if (platformMatch) {
        score += 10;
      }
    } else {
      score += 10; // Movie era normalization
    }

    return {
      item,
      score: Math.min(score, 100)
    };
  });

  // Sort and filter results
  return matchedList
    .filter(match => match.score >= 50)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating);
}

/* ==========================================================================
   3. UI Rendering Engine (Decoupled Card & List Renderers)
   ========================================================================== */

// Renders list of movie cards into specified container
function renderMovies(movies, containerElement) {
  if (!containerElement) return;
  if (movies.length === 0) {
    containerElement.innerHTML = "";
    return;
  }
  containerElement.innerHTML = movies.map(movie => createMovieCardHTML(movie)).join("");
  bindCardClickEvents(containerElement, "movie");
}

// Renders list of game cards into specified container
function renderGames(games, containerElement) {
  if (!containerElement) return;
  if (games.length === 0) {
    containerElement.innerHTML = "";
    return;
  }
  containerElement.innerHTML = games.map(game => createGameCardHTML(game)).join("");
  bindCardClickEvents(containerElement, "game");
}

// Dynamic templates
function createMovieCardHTML(movie) {
  const isFav = isFavorite(movie.id);
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
        <button class="card-btn">Learn More</button>
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
        <button class="card-btn">Learn More</button>
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
    showToast("Removed from Favorites", "fa-heart-broken");
    return false;
  } else {
    favorites.push({ id: itemId, type: itemType });
    saveFavorites(favorites);
    showToast("Added to Favorites", "fa-solid fa-heart");
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
    <div class="modal-badge" style="text-transform: uppercase;">${type}</div>
  `;

  descText.textContent = item.description;

  let metaHtml = `
    <li><strong>Genres:</strong> ${item.genre.join(", ")}</li>
    <li><strong>Mood tags:</strong> ${item.mood ? item.mood.join(", ") : "N/A"}</li>
  `;
  if (type === "game") {
    metaHtml += `<li><strong>Platforms:</strong> ${item.platform.join(", ")}</li>`;
  }
  infoDetails.innerHTML = metaHtml;

  const isFav = isFavorite(item.id);
  actionsContainer.innerHTML = `
    <button class="btn btn-primary" id="modal-play-btn">
      <i class="fa-solid ${type === 'movie' ? 'fa-play' : 'fa-gamepad'}"></i>
      ${type === 'movie' ? 'Watch Trailer' : 'Play Now'}
    </button>
    <button class="btn btn-outline" id="modal-fav-btn">
      <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      ${isFav ? 'Favorited' : 'Add to Favorites'}
    </button>
  `;

  let showingTrailer = false;
  const playBtn = document.getElementById("modal-play-btn");
  playBtn.addEventListener("click", () => {
    if (type === "movie") {
      if (item.trailer) {
        showingTrailer = !showingTrailer;
        if (showingTrailer) {
          posterContainer.innerHTML = `
            <div class="iframe-container" style="width: 100%; height: 100%; min-height: 250px; position: relative;">
              <iframe src="https://www.youtube.com/embed/${item.trailer}?autoplay=1" 
                      title="${item.title} Trailer" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen 
                      style="position: absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius: 12px;">
              </iframe>
            </div>
          `;
          playBtn.innerHTML = `<i class="fa-solid fa-image"></i> Show Poster`;
        } else {
          posterContainer.innerHTML = "";
          posterContainer.appendChild(img);
          playBtn.innerHTML = `<i class="fa-solid fa-play"></i> Watch Trailer`;
        }
      } else {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' official trailer')}`, '_blank');
      }
    } else {
      if (item.steamUrl) {
        window.open(item.steamUrl, '_blank');
      } else {
        window.open(`https://store.steampowered.com/search/?term=${encodeURIComponent(item.title)}`, '_blank');
      }
    }
  });

  const favBtn = document.getElementById("modal-fav-btn");
  favBtn.addEventListener("click", () => {
    const isNowFav = toggleFavorite(item.id, type);
    const favIcon = favBtn.querySelector("i");
    if (isNowFav) {
      favIcon.className = "fa-solid fa-heart";
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    } else {
      favIcon.className = "fa-regular fa-heart";
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
    }
  });

  globalModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!globalModal) return;
  globalModal.classList.remove("active");
  document.body.style.overflow = "";
  // Stop trailer playing audio immediately on modal close
  const posterContainer = document.getElementById("modal-poster-container");
  if (posterContainer) {
    posterContainer.innerHTML = "";
  }
}

/* ==========================================================================
   6. Recently Viewed Tracking
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
   7. Theme / Sticky Header / Mobile Menu UI
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
   8. Stats & Skeletons Observer helpers
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
   9. Decoupled Home Page Feature Initializer
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
  
  // Modal / Notifications
  openDetailsModal,
  closeModal,
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
