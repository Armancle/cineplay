/* CinePlay - Central Data Manager (Cache-First API Pipeline) */

const CinePlayDataManager = {
  // Fetch Movies Pipeline (TMDB -> Firestore -> Local Fallback)
  async fetchMovies({ query = "", genre = "All", sortBy = "popularity-desc", page = 1, limit = 20 } = {}) {
    let movies = [];
    let hasMoreResults = false;

    try {
      if (query) {
        // 1. Search TMDB
        const searchRes = await CinePlayAPIService.searchTMDBMovies(query, page);
        if (searchRes && searchRes.results && searchRes.results.length > 0) {
          hasMoreResults = page < searchRes.total_pages;
          movies = searchRes.results.slice(0, limit).map(m => CinePlayAPIService.normalizeMovie(m)).filter(Boolean);
          movies.forEach(m => CinePlayFirestoreService.saveMovie(m));
        }
      } else {
        // 2. Discover Movies via TMDB
        const genreId = this.getTMDBGenreId(genre);
        const discoverRes = await CinePlayAPIService.discoverTMDBMovies({ genreId, page, sortBy });

        if (discoverRes && discoverRes.results && discoverRes.results.length > 0) {
          hasMoreResults = page < discoverRes.total_pages;
          movies = discoverRes.results.slice(0, limit).map(m => CinePlayAPIService.normalizeMovie(m)).filter(Boolean);
          movies.forEach(m => CinePlayFirestoreService.saveMovie(m));
        }
      }
    } catch (error) {
      console.warn("[CinePlayDataManager] TMDB fetch error:", error);
    }

    // 3. Offline / Fallback Pipeline if API returns empty
    if (movies.length === 0 && window.moviesData) {
      let localMovies = [...window.moviesData];
      if (query) localMovies = CinePlay.searchItems(localMovies, query);
      if (genre !== "All") localMovies = CinePlay.filterByGenre(localMovies, genre);
      CinePlay.sortItems(localMovies, sortBy);

      const start = 0;
      const end = page * limit;
      return {
        results: localMovies.slice(start, end),
        total: localMovies.length,
        hasMore: end < localMovies.length
      };
    }

    return {
      results: movies,
      total: movies.length,
      hasMore: movies.length >= limit
    };
  },

  // Fetch Games Pipeline (Steam Store API -> Firestore -> Local Fallback)
  async fetchGames({ query = "", genre = "All", platform = "All", sortBy = "rating-desc", page = 1, limit = 8 } = {}) {
    let apiGames = [];

    try {
      if (query) {
        // 1. Search Steam Store API
        const steamItems = await CinePlayAPIService.searchSteamStore(query);
        if (steamItems && steamItems.length > 0) {
          const normGames = await Promise.all(steamItems.slice(0, limit).map(async (item) => {
            const appId = String(item.id);
            // Check Firestore Cache
            let cached = await CinePlayFirestoreService.getGame(appId);
            if (cached) return cached;

            // Fetch App Details & Reviews from Steam Store API
            const [details, reviews] = await Promise.all([
              CinePlayAPIService.getSteamGameDetails(appId),
              CinePlayAPIService.getSteamReviews(appId)
            ]);

            const normalized = CinePlayAPIService.normalizeGame(details, reviews);
            if (normalized) {
              CinePlayFirestoreService.saveGame(normalized);
            }
            return normalized;
          }));

          apiGames = normGames.filter(Boolean);
        }
      }
    } catch (error) {
      console.warn("[CinePlayDataManager] Steam API fetch failed, using local fallback:", error);
    }

    // Combine / Fallback with Local Games Dataset
    let games = apiGames;
    if (games.length === 0 && window.gamesData) {
      let localGames = [...window.gamesData];
      if (query) localGames = CinePlay.searchItems(localGames, query);
      if (genre !== "All") localGames = CinePlay.filterByGenre(localGames, genre);
      if (platform !== "All") localGames = localGames.filter(g => g.platform && g.platform.includes(platform));
      CinePlay.sortItems(localGames, sortBy);

      const start = 0;
      const end = page * limit;
      games = localGames.slice(start, end);
    }

    return {
      results: games,
      total: games.length,
      hasMore: (page * limit) < games.length
    };
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
