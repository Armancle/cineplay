/* CinePlay - Central External API Service & Data Normalizer */

const CinePlayAPIService = {
  // Helper for TMDB Requests
  async fetchTMDB(endpoint, params = {}) {
    const config = window.CINEPLAY_CONFIG.TMDB;
    const url = new URL(`${config.BASE_URL}${endpoint}`);
    
    // Add params
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    if (!url.searchParams.has("language")) url.searchParams.append("language", "en-US");

    const headers = {
      "Accept": "application/json"
    };

    if (config.BEARER_TOKEN) {
      headers["Authorization"] = `Bearer ${config.BEARER_TOKEN}`;
    }

    try {
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.warn(`[CinePlayAPIService] TMDB request failed for ${endpoint}:`, error);
      return null;
    }
  },

  // Search Movies on TMDB
  async searchTMDBMovies(query, page = 1) {
    if (!query) return null;
    return await this.fetchTMDB("/search/movie", { query, page });
  },

  // Get TMDB Movie Details
  async getTMDBMovieDetails(tmdbId) {
    if (!tmdbId) return null;
    return await this.fetchTMDB(`/movie/${tmdbId}`);
  },

  // Get TMDB Movie Credits (Cast & Crew)
  async getTMDBMovieCredits(tmdbId) {
    if (!tmdbId) return null;
    return await this.fetchTMDB(`/movie/${tmdbId}/credits`);
  },

  // Get TMDB Watch Providers
  async getTMDBWatchProviders(tmdbId) {
    if (!tmdbId) return null;
    return await this.fetchTMDB(`/movie/${tmdbId}/watch/providers`);
  },

  // Discover TMDB Movies by Filters
  async discoverTMDBMovies(filters = {}) {
    const params = { page: filters.page || 1 };
    if (filters.genreId) params.with_genres = filters.genreId;
    if (filters.year) params.primary_release_year = filters.year;
    if (filters.minRating) params["vote_average.gte"] = filters.minRating;

    if (filters.sortBy === "popularity-desc" || !filters.sortBy) {
      params.sort_by = "popularity.desc";
    } else if (filters.sortBy === "rating-desc") {
      params.sort_by = "vote_average.desc";
      params["vote_count.gte"] = 300;
    } else if (filters.sortBy === "year-desc") {
      params.sort_by = "primary_release_date.desc";
      params["vote_count.gte"] = 20;
    } else if (filters.sortBy === "year-asc") {
      params.sort_by = "primary_release_date.asc";
      params["vote_count.gte"] = 100;
    } else {
      params.sort_by = "popularity.desc";
    }

    return await this.fetchTMDB("/discover/movie", params);
  },

  // Search People (Actors / Directors) on TMDB
  async searchTMDBPeople(query) {
    if (!query) return null;
    return await this.fetchTMDB("/search/person", { query });
  },

  // Get Person Movie Credits
  async getTMDBPersonCredits(personId) {
    if (!personId) return null;
    return await this.fetchTMDB(`/person/${personId}/movie_credits`);
  },

  // Get TMDB Movie Videos (YouTube Trailers)
  async getTMDBMovieVideos(tmdbId) {
    if (!tmdbId) return null;
    return await this.fetchTMDB(`/movie/${tmdbId}/videos`);
  },

  // Get TMDB Movie Keywords
  async getTMDBMovieKeywords(tmdbId) {
    if (!tmdbId) return null;
    return await this.fetchTMDB(`/movie/${tmdbId}/keywords`);
  },

  // Search Live Steam Store Catalog
  async searchSteamStore(query) {
    if (!query) return null;
    try {
      const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=IN`);
      if (!response.ok) throw new Error(`Steam Store Search Error: ${response.status}`);
      const data = await response.json();
      return data && data.items ? data.items : [];
    } catch (error) {
      console.warn(`[CinePlayAPIService] Steam search failed for ${query}:`, error);
      return [];
    }
  },

  // Get Steam Game Reviews / Community Ratings
  async getSteamReviews(appId) {
    if (!appId) return null;
    try {
      const response = await fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all`);
      if (!response.ok) throw new Error(`Steam Reviews Error: ${response.status}`);
      const data = await response.json();
      if (data && data.query_summary) {
        return {
          reviewScoreDesc: data.query_summary.review_score_desc || "Very Positive",
          totalPositive: data.query_summary.total_positive || 0,
          totalReviews: data.query_summary.total_reviews || 0,
          percentPositive: data.query_summary.total_reviews > 0 ? Math.round((data.query_summary.total_positive / data.query_summary.total_reviews) * 100) : 90
        };
      }
      return null;
    } catch (error) {
      console.warn(`[CinePlayAPIService] Steam reviews failed for ${appId}:`, error);
      return null;
    }
  },

  // Helper for Steam Games Fetching
  async getSteamGameDetails(appId) {
    if (!appId) return null;
    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`);
      if (!response.ok) throw new Error(`Steam API Error: ${response.status}`);
      const data = await response.json();
      if (data && data[appId] && data[appId].success) {
        return data[appId].data;
      }
      return null;
    } catch (error) {
      console.warn(`[CinePlayAPIService] Steam request failed for ${appId}:`, error);
      return null;
    }
  },

  /* ==========================================================================
     DATA NORMALIZERS: Converts API formats to CinePlay Standard Objects
     ========================================================================== */

  normalizeMovie(tmdbData, creditsData = null, providersData = null, videosData = null, keywordsData = null, imdbData = null) {
    if (!tmdbData) return null;

    const config = window.CINEPLAY_CONFIG.TMDB;
    const tmdbId = String(tmdbData.id);
    const imdbId = tmdbData.imdb_id || (imdbData ? imdbData.id : `tt${tmdbId}`);

    // Extract Poster & Backdrop URLs
    const poster = tmdbData.poster_path 
      ? `${config.IMAGE_BASE}/${config.POSTER_SIZE}${tmdbData.poster_path}`
      : "images/posters/m1.jpg";

    const backdrop = tmdbData.backdrop_path
      ? `${config.IMAGE_BASE}/${config.BACKDROP_SIZE}${tmdbData.backdrop_path}`
      : poster;

    // Extract Trailer Video Key (YouTube)
    let trailerKey = "dQw4w9WgXcQ";
    if (videosData && videosData.results && videosData.results.length > 0) {
      const trailer = videosData.results.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) || videosData.results[0];
      if (trailer && trailer.key) trailerKey = trailer.key;
    }

    // Extract Keywords
    let keywords = [];
    if (keywordsData && keywordsData.keywords) {
      keywords = keywordsData.keywords.map(k => k.name);
    }

    const genreIdNameMap = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller"
    };

    let genres = [];
    if (tmdbData.genres && tmdbData.genres.length > 0) {
      genres = tmdbData.genres.map(g => g.name);
    } else if (tmdbData.genre_ids && tmdbData.genre_ids.length > 0) {
      genres = tmdbData.genre_ids.map(id => genreIdNameMap[id]).filter(Boolean);
    }
    if (genres.length === 0) genres = ["Action", "Drama"];

    // Extract Release Year & Runtime
    const releaseDate = tmdbData.release_date || "2024-01-01";
    const year = parseInt(releaseDate.split("-")[0]) || 2024;
    const runtime = tmdbData.runtime ? `${tmdbData.runtime}m` : "120m";

    // Extract Ratings
    const tmdbRating = parseFloat((tmdbData.vote_average || 8.0).toFixed(1));
    const imdbRating = imdbData ? parseFloat(imdbData.rating) : tmdbRating;

    // Cast & Directors
    let cast = ["Lead Actor"];
    let directors = ["Director"];

    if (creditsData) {
      if (creditsData.cast && creditsData.cast.length > 0) {
        cast = creditsData.cast.slice(0, 5).map(c => c.name);
      }
      if (creditsData.crew && creditsData.crew.length > 0) {
        const dirList = creditsData.crew.filter(c => c.job === "Director").map(c => c.name);
        if (dirList.length > 0) directors = dirList;
      }
    }

    // Watch Providers by region
    let providers = {
      IN: {
        flatrate: [{ name: "Netflix", logo: "images/posters/m1.jpg", type: "STREAM" }],
        rent: [{ name: "Amazon Prime Video", logo: "images/posters/m2.jpg", type: "RENT" }]
      }
    };

    if (providersData && providersData.results) {
      const region = config.DEFAULT_REGION;
      const regionData = providersData.results[region] || providersData.results["US"];
      if (regionData) {
        providers[region] = {
          flatrate: (regionData.flatrate || []).map(p => ({ name: p.provider_name, logo: `${config.IMAGE_BASE}/w92${p.logo_path}`, type: "STREAM" })),
          rent: (regionData.rent || []).map(p => ({ name: p.provider_name, logo: `${config.IMAGE_BASE}/w92${p.logo_path}`, type: "RENT" })),
          buy: (regionData.buy || []).map(p => ({ name: p.provider_name, logo: `${config.IMAGE_BASE}/w92${p.logo_path}`, type: "BUY" }))
        };
      }
    }

    return {
      id: `tmdb_${tmdbId}`,
      tmdbId: tmdbId,
      imdbId: imdbId,
      imdbUrl: `https://www.imdb.com/title/${imdbId}/`,
      type: "movie",
      title: tmdbData.title || tmdbData.original_title || "Untitled Movie",
      overview: tmdbData.overview || "No overview available.",
      description: tmdbData.overview || "No description available.",
      poster: poster,
      backdrop: backdrop,
      releaseDate: releaseDate,
      year: year,
      duration: runtime,
      runtime: runtime,
      genre: genres.length > 0 ? genres : ["Action", "Sci-Fi"],
      genres: genres,
      keywords: keywords,
      cast: cast,
      directors: directors,
      rating: tmdbRating,
      tmdbRating: tmdbRating,
      imdbRating: imdbRating,
      voteCount: tmdbData.vote_count || 1000,
      trailerUrl: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&enablejsapi=1`,
      trailerKey: trailerKey,
      language: (tmdbData.original_language || "en").toUpperCase(),
      country: tmdbData.production_countries && tmdbData.production_countries.length > 0 ? tmdbData.production_countries[0].name : "USA",
      providers: providers,
      updatedAt: new Date().toISOString()
    };
  },

  normalizeGame(steamAppDetails, reviewsData = null) {
    if (!steamAppDetails) return null;

    const appId = String(steamAppDetails.steam_appid);
    const priceInfo = steamAppDetails.price_overview;
    const priceStr = steamAppDetails.is_free ? "Free" : (priceInfo ? priceInfo.final_formatted : "₹1,499");

    const releaseDate = steamAppDetails.release_date ? steamAppDetails.release_date.date : "2023";
    const yearMatch = releaseDate.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : 2023;

    const genres = steamAppDetails.genres ? steamAppDetails.genres.map(g => g.description) : ["Action", "RPG"];
    const developers = steamAppDetails.developers || ["Game Studio"];
    const publishers = steamAppDetails.publishers || ["Game Publisher"];

    const platforms = [];
    if (steamAppDetails.platforms) {
      if (steamAppDetails.platforms.windows) platforms.push("PC");
      if (steamAppDetails.platforms.mac) platforms.push("Mac");
      if (steamAppDetails.platforms.linux) platforms.push("Linux");
    }
    if (platforms.length === 0) platforms.push("PC", "PlayStation", "Xbox");

    const sysReq = steamAppDetails.pc_requirements && steamAppDetails.pc_requirements.minimum 
      ? steamAppDetails.pc_requirements.minimum.replace(/<[^>]*>?/gm, '') 
      : "Windows 10 64-bit, GTX 1060 / RX 580, 16 GB RAM.";

    const reviewScoreDesc = reviewsData ? reviewsData.reviewScoreDesc : "Very Positive";
    const percentPositive = reviewsData ? reviewsData.percentPositive : 90;
    const rating = parseFloat((percentPositive / 10).toFixed(1));

    return {
      id: `steam_${appId}`,
      steamAppId: appId,
      steamUrl: `https://store.steampowered.com/app/${appId}/`,
      type: "game",
      title: steamAppDetails.name || "Untitled Game",
      name: steamAppDetails.name || "Untitled Game",
      description: steamAppDetails.short_description || steamAppDetails.about_the_game || "No description available.",
      overview: steamAppDetails.short_description || "No overview available.",
      poster: steamAppDetails.header_image || "images/posters/g1.jpg",
      headerImage: steamAppDetails.header_image || "images/posters/g1.jpg",
      backdrop: steamAppDetails.screenshots && steamAppDetails.screenshots.length > 0 ? steamAppDetails.screenshots[0].path_full : steamAppDetails.header_image,
      year: year,
      price: priceStr,
      discount: priceInfo && priceInfo.discount_percent ? `${priceInfo.discount_percent}% OFF` : null,
      rating: rating,
      reviewScoreDesc: reviewScoreDesc,
      percentPositive: percentPositive,
      genre: genres,
      genres: genres,
      tags: genres.concat(platforms),
      platform: platforms,
      platforms: platforms,
      developers: developers,
      publishers: publishers,
      sysReq: sysReq,
      screenshots: steamAppDetails.screenshots ? steamAppDetails.screenshots.map(s => s.path_full) : [],
      updatedAt: new Date().toISOString()
    };
  },

  normalizePerson(tmdbPerson, creditsData = null) {
    if (!tmdbPerson) return null;

    const config = window.CINEPLAY_CONFIG.TMDB;
    const personId = String(tmdbPerson.id);
    const photo = tmdbPerson.profile_path
      ? `${config.IMAGE_BASE}/${config.PROFILE_SIZE}${tmdbPerson.profile_path}`
      : "images/posters/m1.jpg";

    const filmography = creditsData && creditsData.cast 
      ? creditsData.cast.slice(0, 10).map(m => m.title || m.original_title) 
      : (tmdbPerson.known_for ? tmdbPerson.known_for.map(k => k.title || k.name).filter(Boolean) : ["Featured Title"]);

    return {
      id: `person_${personId}`,
      tmdbId: personId,
      name: tmdbPerson.name,
      role: tmdbPerson.known_for_department || "Actor / Director",
      knownForDepartment: tmdbPerson.known_for_department,
      knownFor: filmography.slice(0, 3).join(", "),
      image: photo,
      filmography: filmography,
      updatedAt: new Date().toISOString()
    };
  }
};

window.CinePlayAPIService = CinePlayAPIService;
