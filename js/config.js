/* CinePlay - Central API & Firestore Configuration */

const CINEPLAY_CONFIG = {
  // TMDB API Configuration
  TMDB: {
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_BASE: "https://image.tmdb.org/t/p",
    POSTER_SIZE: "w500",
    BACKDROP_SIZE: "w1280",
    PROFILE_SIZE: "h630",
    DEFAULT_REGION: "IN",
    BEARER_TOKEN: window.CINEPLAY_TMDB_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YWY3NmI0ZTQxZDY3ZDM1YmFkZDBiNGNiMDAyODcwOSIsIm5iZiI6MTc4NzgyMDkzMC4yNDcsInN1YiI6IjZhOGZmYjgyNjUwYzIyNTUwMDMxMDZmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.4w2-uYd37keBO1PmAPh7feM-vP6tsTF9glY1N-vkr2s"
  },

  // Steam API Configuration
  STEAM: {
    STORE_BASE_URL: "https://store.steampowered.com/api",
    COMMUNITY_BASE_URL: "https://api.steampowered.com"
  },

  // IMDb Configuration
  IMDB: {
    GRAPHQL_ENDPOINT: "https://api.graphql.imdb.com"
  },

  // Firestore Cache Configuration
  CACHE: {
    TTL_HOURS: 24,
    EXPIRATION_MS: 24 * 60 * 60 * 1000
  },

  // System Flags
  ENABLE_FIRESTORE_CACHE: true,
  ENABLE_OFFLINE_FALLBACK: true
};

window.CINEPLAY_CONFIG = CINEPLAY_CONFIG;
