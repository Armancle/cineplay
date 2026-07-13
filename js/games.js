/* CinePlay - Games Page Controller */

document.addEventListener("DOMContentLoaded", () => {
  initGamesPage();
  initRecentlyViewedGames();
});

// Grid State Parameters
let activeGenre = "All";
let activePlatform = "All";
let searchQuery = "";
let sortBy = "rating-desc";
let currentPage = 1;
const itemsPerPage = 8;

function initGamesPage() {
  const searchInput = document.getElementById("game-search");
  const sortSelect = document.getElementById("game-sort");
  const platformSelect = document.getElementById("game-platform");
  const genresContainer = document.getElementById("genres-container");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const resetBtn = document.getElementById("btn-reset-filters");

  // Read URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearch = urlParams.get("search");
  const urlGenre = urlParams.get("genre");

  if (urlSearch) {
    searchQuery = decodeURIComponent(urlSearch);
    searchInput.value = searchQuery;
  }

  if (urlGenre) {
    activeGenre = urlGenre;
    genresContainer.querySelectorAll(".genre-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.genre.toLowerCase() === activeGenre.toLowerCase());
    });
  }

  // Bind Events
  searchInput.addEventListener("input", debounce((e) => {
    searchQuery = e.target.value.trim();
    loadGamesGrid(true);
  }, 300));

  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    loadGamesGrid(true);
  });

  platformSelect.addEventListener("change", (e) => {
    activePlatform = e.target.value;
    loadGamesGrid(true);
  });

  genresContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".genre-pill");
    if (!pill) return;

    genresContainer.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeGenre = pill.dataset.genre;
    
    loadGamesGrid(true);
  });

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    loadGamesGrid(false);
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "rating-desc";
    platformSelect.value = "All";
    searchQuery = "";
    sortBy = "rating-desc";
    activeGenre = "All";
    activePlatform = "All";
    
    genresContainer.querySelectorAll(".genre-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.genre === "All");
    });

    loadGamesGrid(true);
  });

  // Sync favorites icons across grid cards
  window.addEventListener("favoritesChanged", syncFavoritesState);

  // Initial fetch load
  loadGamesGrid(true);
}

/* Fetch games from client API service and trigger render */
async function loadGamesGrid(resetPage = true) {
  if (resetPage) currentPage = 1;

  showGridSkeletons();

  try {
    const response = await window.CinePlayAPI.fetchGames({
      query: searchQuery,
      genre: activeGenre,
      platform: activePlatform,
      sortBy: sortBy,
      page: currentPage,
      limit: itemsPerPage
    });

    const grid = document.getElementById("games-grid");
    const loadMoreBtn = document.getElementById("btn-load-more");
    const emptyState = document.getElementById("games-empty");

    if (response.results.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      loadMoreBtn.style.display = "none";
      return;
    }

    emptyState.style.display = "none";

    // Use global render helper
    window.CinePlay.renderGames(response.results, grid);

    // Toggle pagination
    loadMoreBtn.style.display = response.hasMore ? "inline-flex" : "none";
  } catch (error) {
    console.error("CinePlay API error fetching games:", error);
    window.CinePlay.showToast("Error loading catalog.", "fa-circle-exclamation");
  }
}

function showGridSkeletons() {
  const grid = document.getElementById("games-grid");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const emptyState = document.getElementById("games-empty");
  
  emptyState.style.display = "none";
  loadMoreBtn.style.display = "none";

  let skeletonHtml = "";
  for (let i = 0; i < 4; i++) {
    skeletonHtml += `
      <div class="media-card skeleton-card">
        <div class="card-img-wrapper skeleton" style="aspect-ratio: 2/3; height: 320px;"></div>
        <div class="card-content">
          <div class="skeleton" style="height: 12px; width: 45%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 12px;"></div>
          <div class="skeleton" style="height: 12px; width: 50%; margin-bottom: 20px;"></div>
          <div class="skeleton" style="height: 35px; width: 100%;"></div>
        </div>
      </div>
    `;
  }
  grid.innerHTML = skeletonHtml;
}

function syncFavoritesState() {
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".media-card");
  cards.forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector(".card-favorite-btn");
    if (!btn) return;
    const isFav = window.CinePlay.isFavorite(id);
    btn.classList.toggle("active", isFav);
    const icon = btn.querySelector("i");
    if (icon) icon.className = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* ==========================================================================
   Recently Viewed Slider
   ========================================================================== */
function initRecentlyViewedGames() {
  const container = document.getElementById("recently-viewed-container");
  const slider = document.getElementById("recently-viewed-slider");
  if (!container || !slider) return;

  function renderViewed() {
    const viewed = window.CinePlay.getRecentlyViewed();
    const gameViewed = viewed.filter(item => item.type === "game");

    if (gameViewed.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    const games = gameViewed
      .map(v => window.gamesData.find(g => g.id === v.id))
      .filter(Boolean);

    window.CinePlay.renderGames(games, slider);
  }

  renderViewed();
  window.addEventListener("recentlyViewedChanged", renderViewed);
  window.addEventListener("favoritesChanged", renderViewed);
}
