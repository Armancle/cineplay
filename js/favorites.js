/* CinePlay - Favorites & Dislikes Controller (API & Cloud First) */

document.addEventListener("DOMContentLoaded", () => {
  initFavoritesPage();
});

let activeFilter = "all"; // "all", "movie", "game", "disliked"

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
      if (activeFilter === "disliked") {
        if (confirm("Clear your entire disliked list?")) {
          localStorage.removeItem("cineplay_dislikes");
          if (window.CinePlayAuth && window.CinePlayAuth.isLoggedIn()) {
            window.CinePlayAuth.syncDislikesToCloud([]);
          }
          window.dispatchEvent(new Event("dislikesChanged"));
          window.CinePlay.showToast("Cleared disliked list", "fa-trash-can");
          renderFavoritesGrid();
        }
        return;
      }
      if (confirm("Are you sure you want to clear your entire watchlist?")) {
        localStorage.removeItem("cineplay_favorites");
        if (window.CinePlayAuth && window.CinePlayAuth.isLoggedIn()) {
          window.CinePlayAuth.syncFavoritesToCloud([]);
        }
        window.dispatchEvent(new Event("favoritesChanged"));
        window.CinePlay.showToast("Cleared all favorites", "fa-trash-can");
        renderFavoritesGrid();
      }
    });
  }

  window.addEventListener("favoritesChanged", renderFavoritesGrid);
  window.addEventListener("dislikesChanged", renderFavoritesGrid);
  renderFavoritesGrid();
}

/**
 * Resolve a favorited item: fetches live TMDB / Steam API data or uses full snapshot.
 */
async function resolveItem(fav) {
  if (!fav) return null;
  const id = typeof fav === "object" ? fav.id : fav;
  const idStr = String(id);
  const type = (typeof fav === "object" ? fav.type : null) || (idStr.startsWith("g") || idStr.startsWith("steam_") ? "game" : "movie");

  // 1. Try live registry if fully hydrated
  if (window._cineItemRegistry && window._cineItemRegistry[idStr] && window._cineItemRegistry[idStr].genres) {
    return window._cineItemRegistry[idStr];
  }

  // 2. If fav object contains rich snapshot data (has title and poster and genres/overview)
  if (typeof fav === "object" && fav.title && (fav.genres || fav.genre) && (fav.overview || fav.description)) {
    if (window._cineItemRegistry) window._cineItemRegistry[idStr] = fav;
    return fav;
  }

  // 3. Live fetch from TMDB API for movies (starts with "tmdb_" or numeric id or type === "movie")
  if (type === "movie" && window.CinePlayAPIService) {
    const tmdbId = idStr.replace("tmdb_", "");
    if (/^\d+$/.test(tmdbId)) {
      try {
        const [details, credits, videos, providers] = await Promise.all([
          window.CinePlayAPIService.getTMDBMovieDetails(tmdbId),
          window.CinePlayAPIService.getTMDBMovieCredits(tmdbId),
          window.CinePlayAPIService.getTMDBMovieVideos(tmdbId),
          window.CinePlayAPIService.getTMDBWatchProviders(tmdbId)
        ]);
        if (details) {
          const normalized = window.CinePlayAPIService.normalizeMovie(details, credits, providers, videos);
          if (normalized) {
            if (window._cineItemRegistry) window._cineItemRegistry[idStr] = normalized;
            return normalized;
          }
        }
      } catch (err) {
        console.warn("[Favorites] Live TMDB fetch failed for", idStr, err);
      }
    }
  }

  // 4. Live fetch from Steam API for games (starts with "steam_" or type === "game")
  if (type === "game" && window.CinePlayAPIService) {
    const steamAppId = idStr.replace("steam_", "");
    if (/^\d+$/.test(steamAppId)) {
      try {
        const [details, reviews] = await Promise.all([
          window.CinePlayAPIService.getSteamDetailsViaProxy(steamAppId),
          window.CinePlayAPIService.getSteamReviewsViaProxy(steamAppId)
        ]);
        if (details) {
          const normalized = window.CinePlayAPIService.normalizeGame(details, reviews);
          if (normalized) {
            if (window._cineItemRegistry) window._cineItemRegistry[idStr] = normalized;
            return normalized;
          }
        }
      } catch (err) {
        console.warn("[Favorites] Live Steam fetch failed for", idStr, err);
      }
    }
  }

  // 5. Try Firestore if enabled
  if (window.CinePlayFirestoreService && window.CinePlayFirestoreService.isEnabled) {
    try {
      const cached = type === "movie" 
        ? await window.CinePlayFirestoreService.getMovie(idStr)
        : await window.CinePlayFirestoreService.getGame(idStr);
      if (cached) {
        if (window._cineItemRegistry) window._cineItemRegistry[idStr] = cached;
        return cached;
      }
    } catch (e) {}
  }

  // 6. If fav object has at least basic metadata, construct a usable fallback card
  if (typeof fav === "object" && fav.title) {
    return fav;
  }

  // 7. Check local fallback datasets
  const dataSet = type === "movie" ? window.moviesData : window.gamesData;
  if (dataSet) {
    const found = dataSet.find(i => String(i.id) === idStr);
    if (found) return found;
  }

  return null;
}

let isRenderingFavorites = false;

async function renderFavoritesGrid() {
  const grid = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");
  const filterPanel = document.getElementById("favorites-filters");
  const clearBtn = document.getElementById("btn-clear-favorites");
  const sortSelect = document.getElementById("fav-sort");

  if (!grid) return;
  if (isRenderingFavorites) return;
  isRenderingFavorites = true;

  try {
    // ------------- DISLIKED TAB -----------------
    if (activeFilter === "disliked") {
      const dislikedItems = window.CinePlay && window.CinePlay.getDislikedItems ? window.CinePlay.getDislikedItems() : [];

      if (clearBtn) clearBtn.style.display = dislikedItems.length > 0 ? "inline-flex" : "none";

      if (dislikedItems.length === 0) {
        grid.innerHTML = "";
        if (emptyState) {
          emptyState.style.display = "block";
          const t = emptyState.querySelector(".empty-state-title");
          const d = emptyState.querySelector(".empty-state-desc");
          if (t) t.textContent = "No Disliked Items";
          if (d) d.textContent = "Items you mark as 'Not for me' will appear here so you can review or undo them anytime.";
        }
        isRenderingFavorites = false;
        return;
      }

      if (emptyState) emptyState.style.display = "none";

      grid.innerHTML = dislikedItems.map(entry => {
        const safeTitle = (entry.title || "Untitled").replace(/'/g, "\\'");
        const posterUrl = entry.poster || "";
        return `
          <article class="media-card" style="position:relative;" data-id="${entry.id}" data-type="${entry.type || 'movie'}">
            <div class="card-img-wrapper">
              <img src="${posterUrl || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 450\' fill=\'%2314141d\'%3E%3C/svg%3E'}" alt="${entry.title}" class="card-img" loading="lazy" onerror="CinePlay.movieImgFallback(this, '${safeTitle}')">
              <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${entry.rating ? Number(entry.rating).toFixed(1) : '—'}</div>
              <span class="card-type-tag" style="background: rgba(229, 9, 20, 0.85);">${entry.type || 'movie'}</span>
            </div>
            <div class="card-content">
              <div class="card-meta">
                <span>${entry.year || ''}</span>
                <span style="text-transform: uppercase; color: var(--accent-red); font-weight: 700; font-size: 11px;">Disliked</span>
              </div>
              <h3 class="card-title">${entry.title}</h3>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn btn-outline" style="font-size:12px;padding:8px 16px;border-radius:20px;flex:1;border-color:rgba(255,255,255,0.2);" onclick="event.stopPropagation();undoDislike('${entry.id}', this)">
                  <i class="fa-solid fa-rotate-left"></i> Remove from Disliked
                </button>
              </div>
            </div>
          </article>
        `;
      }).join("");
      isRenderingFavorites = false;
      return;
    }

    // ------------- FAVORITES TABS -----------------
    const rawFavs = window.CinePlay && window.CinePlay.getFavorites ? window.CinePlay.getFavorites() : [];

    if (rawFavs.length === 0) {
      grid.innerHTML = "";
      if (filterPanel) filterPanel.style.display = "flex";
      if (clearBtn) clearBtn.style.display = "none";
      if (emptyState) {
        emptyState.style.display = "block";
        const t = emptyState.querySelector(".empty-state-title");
        const d = emptyState.querySelector(".empty-state-desc");
        if (t) t.textContent = "Your library is empty";
        if (d) d.textContent = "You haven't bookmarked any movies or games yet. Click the heart icon on any card to save items to this page.";
      }
      isRenderingFavorites = false;
      return;
    }

    // Show skeleton placeholders while resolving live API details if not cached
    const needsFetch = rawFavs.some(fav => {
      const id = typeof fav === "object" ? fav.id : fav;
      return !(window._cineItemRegistry && window._cineItemRegistry[String(id)] && window._cineItemRegistry[String(id)].genres);
    });

    if (needsFetch && grid.children.length === 0) {
      grid.innerHTML = window.CinePlay && window.CinePlay.renderSkeletonCardsHTML ? window.CinePlay.renderSkeletonCardsHTML(Math.min(rawFavs.length, 8)) : "";
    }

    // Resolve all items in parallel
    const resolvedList = await Promise.all(rawFavs.map(async fav => {
      const item = await resolveItem(fav);
      if (!item) return null;
      const type = (typeof fav === "object" ? fav.type : null) || (item.platform ? "game" : "movie");
      return { item, type };
    }));

    let fullFavs = resolvedList.filter(Boolean);

    let filteredFavs = fullFavs.filter(fav => {
      if (activeFilter === "all") return true;
      return fav.type === activeFilter;
    });

    const sortVal = sortSelect ? sortSelect.value : "recent";
    if (sortVal === "rating") {
      filteredFavs.sort((a, b) => ((b.item.rating || b.item.tmdbRating) || 0) - ((a.item.rating || a.item.tmdbRating) || 0));
    } else if (sortVal === "title") {
      filteredFavs.sort((a, b) => (a.item.title || a.item.name || "").localeCompare(b.item.title || b.item.name || ""));
    }

    if (fullFavs.length === 0) {
      grid.innerHTML = "";
      if (filterPanel) filterPanel.style.display = "flex";
      if (clearBtn) clearBtn.style.display = "none";
      if (emptyState) {
        emptyState.style.display = "block";
        const t = emptyState.querySelector(".empty-state-title");
        const d = emptyState.querySelector(".empty-state-desc");
        if (t) t.textContent = "Your library is empty";
        if (d) d.textContent = "You haven't bookmarked any movies or games yet. Click the heart icon on any card to save items to this page.";
      }
      isRenderingFavorites = false;
      return;
    }

    if (filterPanel) filterPanel.style.display = "flex";
    if (clearBtn) clearBtn.style.display = "inline-flex";

    if (filteredFavs.length === 0) {
      grid.innerHTML = "";
      if (emptyState) {
        emptyState.style.display = "block";
        const t = emptyState.querySelector(".empty-state-title");
        const d = emptyState.querySelector(".empty-state-desc");
        if (t) t.textContent = `No Favorited ${activeFilter === 'movie' ? 'Movies' : 'Games'}`;
        if (d) d.textContent = `You haven't bookmarked any ${activeFilter === 'movie' ? 'movies' : 'games'} in your collection yet.`;
      }
      isRenderingFavorites = false;
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    grid.innerHTML = filteredFavs.map(fav => {
      if (fav.type === "movie") return window.CinePlay.createMovieCardHTML(fav.item);
      return window.CinePlay.createGameCardHTML(fav.item);
    }).join("");

    setupFavCardListeners();
  } catch (err) {
    console.error("[Favorites] renderFavoritesGrid error:", err);
  } finally {
    isRenderingFavorites = false;
  }
}

/** Undo a dislike from the disliked tab */
window.undoDislike = function(itemId, btn) {
  if (window.CinePlay && window.CinePlay.removeDisliked) {
    window.CinePlay.removeDisliked(itemId);
  }
  window.CinePlay.showToast("Removed from disliked list", "fa-rotate-left");

  const card = btn.closest(".media-card");
  if (card) {
    card.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.95)";
    setTimeout(() => renderFavoritesGrid(), 260);
  } else {
    renderFavoritesGrid();
  }
};

function setupFavCardListeners() {
  const cards = document.querySelectorAll("#favorites-grid .media-card");
  cards.forEach(card => {
    card.addEventListener("click", async (e) => {
      if (e.target.closest(".card-favorite-btn") || e.target.closest(".card-btn.btn-outline")) return;
      const id = card.dataset.id;
      const type = card.dataset.type;
      const rawFavs = window.CinePlay.getFavorites ? window.CinePlay.getFavorites() : [];
      const fav = rawFavs.find(f => String(typeof f === "object" ? f.id : f) === String(id));
      const item = await resolveItem(fav || { id, type });
      if (item && window.CinePlay && window.CinePlay.openDetailsModal) {
        window.CinePlay.openDetailsModal(item, type);
      }
    });
  });
}
