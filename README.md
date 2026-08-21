# 🎬 CinePlay | Smart Movie & Game Recommendation Engine

> **Stop Endless Scrolling on Streaming Platforms.** CinePlay uses interactive mood/vibe questions to instantly match users with movies & games tailored to their exact mood, time of day, viewing partner, and available viewing time.

---

## 🌟 Features Overview

- 🍿 **Interactive Initial-Load Mood Quiz ("The Anti-Scroll Popup")**: A 4-step wizard calculating custom recommendation match percentages (e.g., 99% match).
- 🎬 **HD YouTube Trailer Player & Modal**: Built-in video player modal with direct **Watch on YouTube ↗** links.
- 📺 **Streaming Platform Badges**: Real-time badges showing where to watch (Netflix, HBO Max, Prime Video, Apple TV+).
- ❤️ **Watchlist & Favorites System**: Synced with local storage & glassmorphic toast notifications.
- 🔍 **Live Search Auto-Suggestions**: Dynamic dropdown preview with movie thumbnails, star ratings, and genres.
- 🎨 **Modern Glassmorphic Dark UI**: Built with custom HSL colors, smooth CSS animations, neon glows, and full responsive support.

---

## 🚀 Phase 2 Technical Blueprint: API Sync, MySQL Database & Recommendation Engine

This documentation outlines how to expand CinePlay with live IMDb/Streaming APIs, a MySQL database backend, and enhanced ML recommendation accuracy.

---

### 1. 📡 IMDb & Streaming Data API Integration

To replace simulated datasets with real-time data from IMDb, TMDB, RAWG, and streaming platforms:

#### A. Recommended API Providers:
1. **TMDB API (The Movie Database)** (Movies & TV Metadata, Posters, YouTube Trailers)
   - Docs: [https://developer.themoviedb.org](https://developer.themoviedb.org)
   - Free API Key via TMDB account settings.
2. **OMDb / IMDb API** (IMDb Ratings, Metascores, Awards)
   - Docs: [http://www.omdbapi.com](http://www.omdbapi.com)
3. **RAWG Video Games API** (Game Catalog, Platforms, Screenshots)
   - Docs: [https://rawg.io/apidocs](https://rawg.io/apidocs)
4. **WatchMode / JustWatch API** (Streaming platform availability: Netflix, Prime Video, Disney+, etc.)
   - Docs: [https://api.watchmode.com](https://api.watchmode.com)

#### B. API Fetch & Processing Example (Node.js / Express):

```javascript
// backend/services/tmdbService.js
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTrendingMovies() {
  try {
    const response = await axios.get(`${BASE_URL}/trending/movie/week`, {
      params: { api_key: TMDB_API_KEY }
    });
    
    // Fetch video trailer and streaming provider for each movie
    const enrichedMovies = await Promise.all(response.data.results.map(async (movie) => {
      const videos = await axios.get(`${BASE_URL}/movie/${movie.id}/videos`, { params: { api_key: TMDB_API_KEY } });
      const providers = await axios.get(`${BASE_URL}/movie/${movie.id}/watch/providers`, { params: { api_key: TMDB_API_KEY } });
      
      const trailer = videos.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      
      return {
        imdb_id: movie.id,
        title: movie.title,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
        rating: movie.vote_average,
        year: new Date(movie.release_date).getFullYear(),
        description: movie.overview,
        trailer_id: trailer ? trailer.key : null,
        streaming_providers: providers.data.results?.US?.flatrate?.map(p => p.provider_name) || []
      };
    }));
    
    return enrichedMovies;
  } catch (error) {
    console.error('TMDB Fetch Error:', error.message);
  }
}
```

---

### 2. 🗄️ MySQL Database Architecture & Schema

To handle user accounts, custom watchlists, ratings, and cached movie metadata:

#### A. Database Schema (`schema.sql`):

```sql
CREATE DATABASE IF NOT EXISTS cineplay_db;
USE cineplay_db;

-- 1. Users Table (Authentication & Accounts)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. User Preferences (For Recommendation Accuracy)
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    favorite_genres JSON,
    preferred_mood VARCHAR(50) DEFAULT 'Action-packed',
    preferred_time_of_day VARCHAR(30) DEFAULT 'Night',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Movies Cache Table (Synced from IMDb / TMDB)
CREATE TABLE IF NOT EXISTS movies (
    movie_id VARCHAR(50) PRIMARY KEY, -- e.g. TMDB/IMDb ID
    title VARCHAR(255) NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT,
    rating DECIMAL(3,1),
    release_year INT,
    runtime_minutes INT,
    description TEXT,
    trailer_youtube_id VARCHAR(50),
    genres JSON,
    mood_tags JSON,
    streaming_providers JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. User Watchlist / Favorites Table
CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id VARCHAR(50) NOT NULL,
    media_type ENUM('movie', 'game') NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_media (user_id, media_id, media_type)
);
```

#### B. Node.js MySQL Connection Pool Example (`db.js`):

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'cineplay_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

---

### 3. 🎯 Recommendation Engine & Scoring Algorithm

CinePlay calculates recommendations using a weighted multi-factor scoring formula:

$$\text{Score} = (W_{\text{mood}} \cdot S_{\text{mood}}) + (W_{\text{genre}} \cdot S_{\text{genre}}) + (W_{\text{era}} \cdot S_{\text{era}}) + (W_{\text{duration}} \cdot S_{\text{duration}})$$

#### Formula Weights:
- **Mood Compatibility ($W_{\text{mood}} = 40\%$)**: Matches mood tags (e.g. *Action-packed*, *Chill*, *Mind-Bending*).
- **Genre Alignment ($W_{\text{genre}} = 30\%$)**: User preferred genres.
- **Era Match ($W_{\text{era}} = 20\%$)**: Classic (<2010), Golden (2010-2019), Modern (2020+).
- **Duration / Time Slot ($W_{\text{duration}} = 10\%$)**: Adjusts according to user's time limit (<90m, 2h, 2.5h+).

---

## 🛠️ Project Structure

```
cineplay/
├── index.html              # Main Landing Page with Anti-Scroll Callout & Hero Slider
├── movies.html             # Movies Catalog & Filters
├── games.html              # Games Catalog & Filters
├── recommendations.html    # Standalone Recommendation Engine Page
├── favorites.html          # User Watchlist & Favorites Page
├── about.html              # Project Info & Tech Stack
├── css/
│   ├── style.css           # Core Design Tokens & Glassmorphism Rules
│   ├── animations.css      # Keyframes, Shimmer Skeletons, Glow Effects
│   └── responsive.css      # Mobile, Tablet & Widescreen Responsive Rules
├── js/
│   ├── data.js             # Enriched Local Datasets (IMDb, Trailers, Streaming)
│   ├── app.js              # Global Application & Modal Controllers
│   ├── recommendation.js   # Recommendation Algorithm Logic
│   └── favorites.js        # Watchlist State Hooks
├── run_server.py           # Python Local HTTP Server Launcher
└── README.md               # Complete Project Documentation & API Blueprint
```

---

## 💻 Local Setup & Running Instructions

1. **Navigate to Project Directory**:
   ```bash
   cd d:\code\cineplay
   ```
2. **Start Local Python Dev Server**:
   ```bash
   python run_server.py
   ```
3. **Open in Browser**:
   Navigate to [http://localhost:8000](http://localhost:8000)

---

## 🚀 How to Push Changes to Production (GitHub Pages & Vercel)

### Option 1: Automatic Deployment via Git (Recommended for both Vercel & GitHub Pages)
If your repository is already connected to GitHub and Vercel:

```bash
# 1. Stage all updated files
git add .

# 2. Commit the changes
git commit -m "feat: UI overhaul, mood quiz modal, bug fixes, and README"

# 3. Push to main branch
git push origin main
```
- **GitHub Pages**: Automatically detects changes and deploys the new static site to `https://<username>.github.io/cineplay/` within 1–2 minutes.
- **Vercel**: Automatically triggers a new production build and updates your live domain (`https://cineplay.vercel.app`) instantly.

---

### Option 2: Deploying Directly via Vercel CLI
If you want to deploy from your terminal without committing to Git:

```bash
# Run Vercel CLI for Production Deployment
npx vercel --prod
```

---

### Option 3: Manual Upload via GitHub Web Interface
1. Go to your GitHub repository in your web browser.
2. Click **Add file** -> **Upload files**.
3. Drag & drop the updated files (`index.html`, `css/style.css`, `js/data.js`, `js/app.js`, `README.md`).
4. Click **Commit changes**. GitHub Pages & Vercel will auto-update automatically!

