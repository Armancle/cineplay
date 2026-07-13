/* CinePlay - Movies Page Controller */

document.addEventListener("DOMContentLoaded", () => {
  initMoviesPage();
  initRecentlyViewedMovies();
});

// Grid State Parameters
let activeGenre = "All";
let searchQuery = "";
let sortBy = "rating-desc";
let currentPage = 1;
const itemsPerPage = 8;

function initMoviesPage() {
  const searchInput = document.getElementById("movie-search");
  const sortSelect = document.getElementById("movie-sort");
  const genresContainer = document.getElementById("genres-container");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const resetBtn = document.getElementById("btn-reset-filters");

  // Read redirects parameters from URL query string
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

  // Event bindings
  searchInput.addEventListener("input", debounce((e) => {
    searchQuery = e.target.value.trim();
    loadMoviesGrid(true);
  }, 300));

  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    loadMoviesGrid(true);
  });

  genresContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".genre-pill");
    if (!pill) return;

    genresContainer.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeGenre = pill.dataset.genre;
    
    loadMoviesGrid(true);
  });

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    loadMoviesGrid(false);
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "rating-desc";
    searchQuery = "";
    sortBy = "rating-desc";
    activeGenre = "All";
    
    genresContainer.querySelectorAll(".genre-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.genre === "All");
    });

    loadMoviesGrid(true);
  });

  // Sync favorites icons across grid cards
  window.addEventListener("favoritesChanged", syncFavoritesState);

  // Initial catalog fetch
  loadMoviesGrid(true);
}

/* Fetch movies from server/API service and trigger render */
async function loadMoviesGrid(resetPage = true) {
  if (resetPage) currentPage = 1;

  showGridSkeletons();

  try {
    // Decoupled API fetch parameters
    const response = await window.CinePlayAPI.fetchMovies({
      query: searchQuery,
      genre: activeGenre,
      sortBy: sortBy,
      page: currentPage,
      limit: itemsPerPage
    });

    const grid = document.getElementById("movies-grid");
    const loadMoreBtn = document.getElementById("btn-load-more");
    const emptyState = document.getElementById("movies-empty");

    if (response.results.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      loadMoreBtn.style.display = "none";
      return;
    }

    emptyState.style.display = "none";

    // Use global render method
    window.CinePlay.renderMovies(response.results, grid);

    // Toggle pagination
    loadMoreBtn.style.display = response.hasMore ? "inline-flex" : "none";
  } catch (error) {
    console.error("CinePlay API error fetching movies:", error);
    window.CinePlay.showToast("Error loading catalog.", "fa-circle-exclamation");
  }
}

function showGridSkeletons() {
  const grid = document.getElementById("movies-grid");
  const loadMoreBtn = document.getElementById("btn-load-more");
  const emptyState = document.getElementById("movies-empty");
  
  emptyState.style.display = "none";
  loadMoreBtn.style.display = "none";

  let skeletonHtml = "";
  for (let i = 0; i < 4; i++) {
    skeletonHtml += `
      <div class="media-card skeleton-card">
        <div class="card-img-wrapper skeleton" style="aspect-ratio: 2/3; height: 320px;"></div>
        <div class="card-content">
          <div class="skeleton" style="height: 12px; width: 40%; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 20px; width: 85%; margin-bottom: 12px;"></div>
          <div class="skeleton" style="height: 12px; width: 60%; margin-bottom: 20px;"></div>
          <div class="skeleton" style="height: 35px; width: 100%;"></div>
        </div>
      </div>
    `;
  }
  grid.innerHTML = skeletonHtml;
}

function syncFavoritesState() {
  const grid = document.getElementById("movies-grid");
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
   Recently Viewed Slider (Simulated API lookup for viewed elements)
   ========================================================================== */
function initRecentlyViewedMovies() {
  const container = document.getElementById("recently-viewed-container");
  const slider = document.getElementById("recently-viewed-slider");
  if (!container || !slider) return;

  function renderViewed() {
    const viewed = window.CinePlay.getRecentlyViewed();
    const movieViewed = viewed.filter(item => item.type === "movie");

    if (movieViewed.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    const movies = movieViewed
      .map(v => window.moviesData.find(m => m.id === v.id))
      .filter(Boolean);

    window.CinePlay.renderMovies(movies, slider);
  }

  renderViewed();
  window.addEventListener("recentlyViewedChanged", renderViewed);
  window.addEventListener("favoritesChanged", renderViewed);
}
