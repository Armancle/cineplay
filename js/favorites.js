/* CinePlay - Favorites Controller */

document.addEventListener("DOMContentLoaded", () => {
  initFavoritesPage();
});

let activeFilter = "all"; // "all", "movie", "game"

function initFavoritesPage() {
  const filterContainer = document.getElementById("fav-filter-container");
  const clearBtn = document.getElementById("btn-clear-favorites");

  const sortSelect = document.getElementById("fav-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      renderFavoritesGrid();
    });
  }

  if (filterContainer) {
    filterContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".genre-pill");
      if (!pill) return;

      filterContainer.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeFilter = pill.dataset.type;

      renderFavoritesGrid();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire collection?")) {
        localStorage.removeItem("cineplay_favorites");
        window.dispatchEvent(new Event("favoritesChanged"));
        window.CinePlay.showToast("Cleared all favorites", "fa-trash-can");
        renderFavoritesGrid();
      }
    });
  }

  window.addEventListener("favoritesChanged", renderFavoritesGrid);
  renderFavoritesGrid();
}

function renderFavoritesGrid() {
  const grid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");
  const filterPanel = document.getElementById("favorites-filters");
  const clearBtn = document.getElementById("btn-clear-favorites");
  const sortSelect = document.getElementById("fav-sort");

  if (!grid) return;

  const rawFavs = window.CinePlay.getFavorites();

  let fullFavs = rawFavs.map(fav => {
    const dataSet = fav.type === "movie" ? window.moviesData : window.gamesData;
    if (!dataSet) return null;
    const item = dataSet.find(i => i.id === fav.id);
    if (!item) return null;
    return { item, type: fav.type };
  }).filter(Boolean);

  let filteredFavs = fullFavs.filter(fav => {
    if (activeFilter === "all") return true;
    return fav.type === activeFilter;
  });

  const sortVal = sortSelect ? sortSelect.value : "recent";
  if (sortVal === "rating") {
    filteredFavs.sort((a, b) => (b.item.rating || 0) - (a.item.rating || 0));
  } else if (sortVal === "title") {
    filteredFavs.sort((a, b) => a.item.title.localeCompare(b.item.title));
  }

  if (fullFavs.length === 0) {
    grid.innerHTML = "";
    if (filterPanel) filterPanel.style.display = "flex";
    if (clearBtn) clearBtn.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (filterPanel) filterPanel.style.display = "flex";
  if (clearBtn) clearBtn.style.display = "inline-flex";

  if (filteredFavs.length === 0) {
    grid.innerHTML = "";
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.querySelector(".empty-state-title").textContent = `No Favorited ${activeFilter === 'movie' ? 'Movies' : 'Games'}`;
      emptyState.querySelector(".empty-state-desc").textContent = `You haven't bookmarked any ${activeFilter === 'movie' ? 'movies' : 'games'} in your collection yet. Click the heart icon on any card to save it for instant offline access.`;
    }
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  grid.innerHTML = filteredFavs.map(fav => {
    if (fav.type === "movie") return window.CinePlay.createMovieCardHTML(fav.item);
    return window.CinePlay.createGameCardHTML(fav.item);
  }).join("");

  setupFavCardListeners();
}

function setupFavCardListeners() {
  const cards = document.querySelectorAll("#favorites-grid .media-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const type = card.dataset.type;
      const dataSet = type === "movie" ? window.moviesData : window.gamesData;
      const item = dataSet.find(i => i.id === id);
      if (item) {
        window.CinePlay.openDetailsModal(item, type);
      }
    });
  });
}
