/* CinePlay - Central Data Manager (Cache-First API Pipeline) */

const CinePlayDataManager = {
  // Fetch Movies Pipeline (TMDB -> Firestore -> Local Fallback)
  // Fetch Movies Pipeline (TMDB -> Firestore -> Local Fallback)
  async fetchMovies({ query = "", genre = "All", sortBy = "popularity-desc", page = 1, limit = 20 } = {}) {
    let movies = [];
    let hasMoreResults = false;
    let totalCount = 0;
    let apiFailed = false;

    try {
      // Build TMDB discover parameters
      const params = { page: page };

      if (genre !== "All") {
        const genreId = this.getTMDBGenreId(genre);
        if (genreId) params.with_genres = genreId;
      }

      if (sortBy === "popularity-desc" || !sortBy) {
        params.sort_by = "popularity.desc";
      } else if (sortBy === "rating-desc") {
        params.sort_by = "vote_average.desc";
        params["vote_count.gte"] = 300;
      } else if (sortBy === "year-desc") {
        params.sort_by = "primary_release_date.desc";
        params["vote_count.gte"] = 20;
      } else if (sortBy === "year-asc") {
        params.sort_by = "primary_release_date.asc";
        params["vote_count.gte"] = 100;
      } else {
        params.sort_by = "popularity.desc";
      }

      let apiResponse = null;

      if (query) {
        apiResponse = await CinePlayAPIService.searchTMDBMovies(query, page);
      } else {
        apiResponse = await CinePlayAPIService.discoverTMDBMovies(params);
      }

      // Check if we got a valid response
      if (apiResponse && apiResponse.results && apiResponse.results.length > 0) {
        hasMoreResults = page < apiResponse.total_pages;
        totalCount = apiResponse.total_results || apiResponse.results.length;
        movies = apiResponse.results.slice(0, limit).map(m => CinePlayAPIService.normalizeMovie(m)).filter(Boolean);

        // Cache in Firestore
        movies.forEach(m => CinePlayFirestoreService.saveMovie(m));

        console.log(`[CinePlayDataManager] ✅ API returned ${movies.length} movies`);
        return { results: movies, total: totalCount, hasMore: hasMoreResults };
      } else {
        console.warn("[CinePlayDataManager] ⚠️ API returned empty or no results");
        apiFailed = true;
      }
    } catch (error) {
      console.warn("[CinePlayDataManager] ❌ TMDB fetch error:", error);
      apiFailed = true;
    }

    // ⚠️ FALLBACK: Only use local data if API completely fails
    if (apiFailed && window.moviesData && window.moviesData.length > 0) {
      console.warn("[CinePlayDataManager] ⚠️ Using LOCAL FALLBACK data (API failed)");
      let localMovies = [...window.moviesData];
      if (query) localMovies = CinePlay.searchItems(localMovies, query);
      if (genre !== "All") localMovies = CinePlay.filterByGenre(localMovies, genre);
      CinePlay.sortItems(localMovies, sortBy);

      const total = localMovies.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        results: localMovies.slice(start, end),
        total: total,
        hasMore: end < total
      };
    }

    return { results: [], total: 0, hasMore: false };
  },

  // Fetch Games Pipeline (Steam Store API -> Firestore -> Local Fallback)
  // Fetch Games Pipeline (Steam Store API -> Firestore -> Local Fallback)
  // Fetch Games Pipeline (Steam via Proxy -> Local Fallback)
  // Fetch Games Pipeline (Local First -> Steam via Proxy)
  async fetchGames({ query = "", genre = "All", platform = "All", sortBy = "rating-desc", page = 1, limit = 8 } = {}) {
    // ✅ ALWAYS use local games data first (it's reliable)
    if (window.gamesData && window.gamesData.length > 0) {
      console.log("[Games] Using local game data");
      let localGames = [...window.gamesData];
      if (query) localGames = CinePlay.searchItems(localGames, query);
      if (genre !== "All") localGames = CinePlay.filterByGenre(localGames, genre);
      if (platform !== "All") localGames = localGames.filter(g => g.platform && g.platform.includes(platform));
      CinePlay.sortItems(localGames, sortBy);

      const total = localGames.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        results: localGames.slice(start, end),
        total: total,
        hasMore: end < total
      };
    }

    // If no local data, try Steam API via proxy
    try {
      let apiGames = [];
      if (query) {
        const steamItems = await CinePlayAPIService.searchSteamViaProxy(query);
        if (steamItems && steamItems.length > 0) {
          const normGames = await Promise.all(steamItems.slice(0, limit * page).map(async (item) => {
            const appId = String(item.id);

            let cached = await CinePlayFirestoreService.getGame(appId);
            if (cached) return cached;

            const [details, reviews] = await Promise.all([
              CinePlayAPIService.getSteamDetailsViaProxy(appId),
              CinePlayAPIService.getSteamReviewsViaProxy(appId)
            ]);

            const normalized = CinePlayAPIService.normalizeGame(details, reviews);
            if (normalized) {
              CinePlayFirestoreService.saveGame(normalized);
            }
            return normalized;
          }));

          apiGames = normGames.filter(Boolean);
          if (apiGames.length > 0) {
            return { results: apiGames, total: apiGames.length, hasMore: false };
          }
        }
      }
    } catch (error) {
      console.warn("[Games] Steam API failed:", error);
    }

    return { results: [], total: 0, hasMore: false };
  },

  // Helper mapping TMDB Genre Names to IDs
  getTMDBGenreId(genreName) {
    const map = {
      "Action": 28,
      "Adventure": 12,
      "Animation": 16,
      "Comedy": 35,
      "Crime": 80,
      "Documentary": 99,
      "Drama": 18,
      "Family": 10751,
      "Fantasy": 14,
      "History": 36,
      "Horror": 27,
      "Music": 10402,
      "Mystery": 9648,
      "Romance": 10749,
      "Sci-Fi": 878,
      "Thriller": 53
    };
    return map[genreName] || null;
  }
};

window.CinePlayDataManager = CinePlayDataManager;