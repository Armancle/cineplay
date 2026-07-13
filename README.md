# 🎬 CinePlay — Movie & Game Matchmaker Portal

<p align="center">
  <img src="https://img.shields.io/badge/BCA%20Mini%20Project-Grade%20A%2B-e50914?style=for-the-badge&logo=codeforces&logoColor=white" alt="BCA Mini Project">
  <img src="https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20ES6%2B-ffd54f?style=for-the-badge&logo=javascript&logoColor=black" alt="Frontend Stack">
  <img src="https://img.shields.io/badge/Architecture-Decoupled%20MVC-00b0ff?style=for-the-badge&logo=dependabot&logoColor=white" alt="Architecture">
  <img src="https://img.shields.io/badge/Offline-100%25%20Functional-00c853?style=for-the-badge&logo=pwa&logoColor=white" alt="Offline Ready">
  <img src="https://img.shields.io/badge/Pages-6%20Responsive%20Pages-9c27b0?style=for-the-badge&logo=html5&logoColor=white" alt="6 Pages">
  <img src="https://img.shields.io/badge/Dataset-42%2B%20Movies%20%26%20Games-ff6f00?style=for-the-badge&logo=themoviedatabase&logoColor=white" alt="Dataset">
</p>

<p align="center">
  <b>A professional-grade entertainment discovery platform built entirely with semantic HTML5, modular CSS3, and ES6+ JavaScript.</b><br>
  Inspired by Netflix · Steam · IMDb &nbsp;|&nbsp; Glassmorphic Dark UI · Decoupled Architecture · TMDB/RAWG API-Ready
</p>

---

## ✨ Project Overview

**CinePlay** is a full-featured, client-side entertainment catalog and smart matchmaking platform. It covers the complete end-to-end user journey — from browsing and searching curated movie and game catalogs, to running an interactive recommendation quiz that matches users with the perfect content based on their mood, genre preference, release era, and platform.

Built as a **BCA (Bachelor of Computer Applications) Mini Project**, the platform demonstrates advanced frontend engineering practices including decoupled data-UI architecture, async API simulation, and pixel-perfect responsive design.

| Aspect | Details |
|---|---|
| **Project Type** | BCA Semester Mini Project |
| **Tech Approach** | Client-side only — No backend, no API keys required |
| **Design Theme** | Dark glassmorphism + Red/Gold accent palette |
| **Offline Support** | ✅ Fully functional with no internet |
| **API Ready** | ✅ Swap-ready for TMDB Movies & RAWG Games APIs |
| **Responsive** | ✅ Mobile (375px) → Desktop (1440px+) |
| **Pages** | 6 fully functional HTML pages |
| **Dataset** | 21 curated movies + 21 curated games |

---

## 🚀 Quick Start

> **One command to launch the entire platform:**

```bash
# Step 1: Navigate to the project root
cd c:\your-path\projects\cineplay

# Step 2: Start the development server
python run_server.py

# Step 3: Open the portal automatically at:
# 👉 http://localhost:8000/
```

> No npm, no build tools, no API keys. It just works. ✅

---

## 📂 Project Structure

```
CinePlay/
│
├── 📄 index.html              → Home Page
│                                  ⤷ Auto-rotating hero banner carousel (3 slides)
│                                  ⤷ Live search bar with type routing
│                                  ⤷ Top-rated Movies & Games horizontal sliders
│                                  ⤷ Genre showcase grid (5 categories)
│                                  ⤷ Animated live statistics counters
│                                  ⤷ CTA recommendation panel & Newsletter form
│
├── 📄 movies.html             → Movies Catalog
│                                  ⤷ Paginated responsive grid (8 cards/page)
│                                  ⤷ Real-time debounced keyword search
│                                  ⤷ 9 genre filter pills with active toggle states
│                                  ⤷ 4 sort options (rating high/low, year new/old)
│                                  ⤷ Recently viewed horizontal slider
│
├── 📄 games.html              → Games Catalog
│                                  ⤷ Platform filter (PC / PlayStation / Xbox / Switch)
│                                  ⤷ 8 genre pills + sorting controls
│                                  ⤷ Skeleton shimmer loading screens
│                                  ⤷ Recently viewed horizontal slider
│
├── 📄 recommendations.html    → Smart Matchmaker Quiz
│                                  ⤷ 5-step interactive questionnaire
│                                  ⤷ Animated radar pulse loader during scoring
│                                  ⤷ Weighted 100-point scoring engine
│                                  ⤷ Match percentage progress meters per result card
│
├── 📄 favorites.html          → Personal Bookmarks Library
│                                  ⤷ Filter by Movie / Game / Show All
│                                  ⤷ Clear entire collection with confirmation
│                                  ⤷ Animated empty state with navigation CTAs
│
├── 📄 about.html              → Project Info & Team
│                                  ⤷ Feature list & technology stack display
│                                  ⤷ SVG gradient developer profile cards
│                                  ⤷ Live feedback form with toast confirmation
│
├── 🐍 run_server.py           → Python one-click development server launcher
│
├── 📁 css/
│   ├── style.css              → Design tokens, layout panels, modal system, cards
│   ├── responsive.css         → Media breakpoints: 992px / 768px / 576px
│   └── animations.css         → Shimmer, scroll-reveal, toast, radar pulse keyframes
│
└── 📁 js/
    ├── data.js                → 21 movies + 21 games static dataset
    ├── app.js                 → CinePlayAPI client + CinePlay namespace + global logic
    ├── movies.js              → Movies page controller (search, filter, sort, paginate)
    ├── games.js               → Games page controller (platform, genre, sort, paginate)
    ├── recommendation.js      → Matchmaker stepper, scoring engine, result renderer
    └── favorites.js           → Bookmarks renderer & collection manager
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#121212` | Page background (deep dark) |
| `--bg-secondary` | `#1f1f1f` | Cards, footer, and panel backgrounds |
| `--accent-red` | `#e50914` | Brand identity, CTA buttons, active states |
| `--rating-yellow` | `#ffd54f` | Star ratings and animated stat numbers |
| `--text-primary` | `#ffffff` | Headings and primary labels |
| `--text-secondary` | `#b3b3b3` | Descriptions, metadata, and captions |

### Typography
- **Font Family**: `Poppins` — Google Fonts (Geometric sans-serif)
- **Weights**: 300 Light · 400 Regular · 500 Medium · 600 Semi-Bold · 700 Bold · 800 Extra-Bold

### Key CSS Techniques
- **Glassmorphism**: `backdrop-filter: blur(12px)` with semi-transparent borders
- **CSS Custom Properties**: Full dark/light theme switching via `:root` + `[data-theme="light"]`
- **CSS Grid**: `repeat(auto-fill, minmax(220px, 1fr))` fully responsive card grids
- **Flexbox**: Nav bars, filter rows, card layouts, footer columns, modal bodies
- **Keyframe Animations**: Shimmer gradient, toast slide-in, radar pulse, counter tick, scroll reveal

---

## ⚙️ JavaScript Architecture

### 1. Global API Client — `CinePlayAPI`

All data access is channeled exclusively through this simulated async service client. Migrating to live APIs requires changes only inside these 3 functions:

```js
const CinePlayAPI = {
  async fetchMovies({ query, genre, sortBy, page, limit }) { ... },
  async fetchGames({ query, genre, platform, sortBy, page, limit }) { ... },
  async fetchRecommendations(criteria) { ... }
};
```

> 🔌 **Future API Migration**: Replace function bodies with `fetch()` calls to TMDB & RAWG. All page controllers, card renderers, and filter logic remain unchanged.

---

### 2. Global Utility Namespace — `window.CinePlay`

| Function | Type | Description |
|---|---|---|
| `renderMovies(movies, container)` | UI Renderer | Hydrates a DOM element with movie card HTML |
| `renderGames(games, container)` | UI Renderer | Hydrates a DOM element with game card HTML |
| `createMovieCardHTML(movie)` | Template | Returns a complete movie card HTML string |
| `createGameCardHTML(game)` | Template | Returns a complete game card HTML string |
| `searchItems(items, query)` | Data Processor | Keyword search across title and genre fields |
| `filterByGenre(items, genre)` | Data Processor | Array containment filter by genre string |
| `sortItems(items, sortBy)` | Data Processor | In-place sort by rating or release year |
| `getRecommendations(criteria)` | Data Processor | Weighted scoring — returns ranked matches |
| `toggleFavorite(id, type)` | State Hook | Toggle item in/out of LocalStorage collection |
| `isFavorite(id)` | State Hook | Boolean bookmark status check |
| `getFavorites()` | State Hook | Returns full LocalStorage bookmarks array |
| `openDetailsModal(item, type)` | UI Component | Opens glassmorphic full-detail modal overlay |
| `showToast(message, icon)` | UI Component | Animates bottom-left toast notification |
| `trackRecentlyViewed(id, type)` | History Hook | Saves item to recently viewed list (max 6) |
| `getRecentlyViewed()` | History Hook | Returns recently viewed items array |

---

## 🧠 Recommendation Scoring Algorithm

The matchmaker calculates a **100-point weighted compatibility score** for every item in the dataset:

```
Score = Mood Match (40pts) + Genre Match (30pts) + Era Match (20pts) + Platform Match (10pts)
```

| Criteria | Weight | Logic |
|---|---|---|
| **Mood Tag Match** | 40 pts | Checks `item.mood[]` array for user-selected mood string |
| **Genre Match** | 30 pts | Checks `item.genre[]` array for user-selected genre |
| **Release Era** | 20 pts | Classic `<2010`, Golden `2010–2019`, Modern `2020+`, or Any |
| **Platform Match** | 10 pts | Checks `item.platform[]` for selected platform (games only) |

- Results with **score ≥ 50** are displayed
- Final list is sorted: **descending score**, then **descending rating** as tiebreaker
- Each card displays an animated **match % progress bar** (CSS `--match-width` variable)

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|---|---|---|
| **Desktop** | `> 992px` | 4-column footer, horizontal modal layout, full nav bar |
| **Tablet** | `≤ 992px` | 2-column footer, stacked modal poster on top |
| **Mobile** | `≤ 768px` | Burger menu drawer, stacked search inputs |
| **Small Mobile** | `≤ 576px` | 1-column stats, simplified hero, stacked form controls |

---

## 🔥 Complete Feature Checklist

### Core Pages & Navigation
- [x] Sticky glassmorphic header with scroll activation trigger
- [x] Mobile slide-in navigation drawer with dark overlay backdrop
- [x] Dark ↔ Light theme toggle (persisted via `localStorage`)
- [x] Back-to-top floating button (appears after 400px scroll)
- [x] Fully accessible semantic HTML structure across all 6 pages
- [x] Active nav link highlighting per current page

### Home Page
- [x] Auto-rotating hero banner carousel with dot navigation (6s interval)
- [x] Previous / Next carousel button controls
- [x] Live search bar with Movies / Games type routing selector
- [x] Top-rated Movies horizontal scrolling slider
- [x] Top-rated Games horizontal scrolling slider
- [x] Genre category showcase grid (5 tile cards)
- [x] Animated statistics counters (scroll-triggered IntersectionObserver)
- [x] CTA recommendation banner panel
- [x] Newsletter subscription form with toast confirmation

### Catalogs (Movies & Games)
- [x] Responsive auto-fill card grid layout
- [x] Skeleton shimmer card placeholders during data load (400ms)
- [x] Real-time debounced keyword search (300ms)
- [x] Genre pill filter buttons with active state toggling
- [x] Platform selector dropdown (Games: PC, PlayStation, Xbox, Switch)
- [x] 4-option sort control (rating ↑↓, year ↑↓)
- [x] "Load More" pagination (8 items per chunk)
- [x] Recently Viewed horizontal slider (last 6 items)
- [x] Empty state display with reset filters CTA
- [x] URL parameter support for search/genre redirect from homepage

### Card Components
- [x] Movie / Game poster image with hover zoom effect
- [x] Star rating badge overlay (top-left)
- [x] Heart favorite toggle button (top-right, cross-page sync)
- [x] Content type tag badge (bottom-left)
- [x] Year, runtime / platform metadata
- [x] Genre pill tags (max 3 displayed)
- [x] Description text (clamped to 2 lines)
- [x] "Learn More" action button → Opens details modal
- [x] Offline CSS gradient fallback when image fails to load

### Details Modal
- [x] Glassmorphic full-detail overlay panel
- [x] Item poster image with fallback
- [x] Rating, year, runtime/platform badge row
- [x] Full description text
- [x] Genres and mood tags metadata
- [x] Platform list (games only)
- [x] "Watch Trailer" / "Play Now" action button
- [x] Favorite toggle with live state update
- [x] Background click and X button to close

### Recommendation Matchmaker
- [x] Step 1: Content type selection (Movie / Game)
- [x] Step 2: Mood selection (6 options)
- [x] Step 3: Genre selection (dynamically mapped to content type)
- [x] Step 4: Release era selection (4 options)
- [x] Step 5: Platform selection (5 options — Games only)
- [x] Progress bar indicator with step count label
- [x] Continue / Back navigation with validation gates
- [x] Animated radar pulse loading screen during score calculation
- [x] Match percentage progress meter bar per result card
- [x] "Restart Matchmaker" button on results view
- [x] Empty results state with restart CTA

### Favorites Library
- [x] Render all favorited movies and games from LocalStorage
- [x] Filter tabs: All / Movies / Games
- [x] Remove individual items via heart toggle
- [x] Clear all favorites with browser confirmation dialog
- [x] Animated empty state (icon, message, explore CTAs)
- [x] Live sync when favorites change via `favoritesChanged` event

### About Page
- [x] Project overview and feature list with check icons
- [x] Technology stack display with brand icons
- [x] SVG gradient developer avatar profile cards
- [x] Developer roles and social links
- [x] Live contact/feedback form with toast on submit

### Global UX
- [x] Toast notification system (slide-in, auto-dismiss 3s, stacking)
- [x] Scroll-reveal animations (IntersectionObserver 10% threshold)
- [x] Lazy image loading (`loading="lazy"` + IntersectionObserver polyfill)
- [x] `recentlyViewedChanged` custom event broadcasting
- [x] `favoritesChanged` custom event broadcasting

---

## 🗃️ Dataset Preview

### Movies (21 Total)

| Title | Genre | Rating | Year |
|---|---|---|---|
| The Dark Knight | Action, Crime, Drama | ⭐ 9.0 | 2008 |
| The Shawshank Redemption | Drama | ⭐ 9.3 | 1994 |
| Pulp Fiction | Crime, Drama | ⭐ 8.9 | 1994 |
| Dune: Part Two | Sci-Fi, Action, Adventure | ⭐ 8.9 | 2024 |
| Inception | Sci-Fi, Action, Thriller | ⭐ 8.8 | 2010 |
| Interstellar | Sci-Fi, Drama, Adventure | ⭐ 8.7 | 2014 |
| The Matrix | Sci-Fi, Action | ⭐ 8.7 | 1999 |
| Spirited Away | Animation, Adventure, Fantasy | ⭐ 8.6 | 2001 |
| Parasite | Drama, Thriller, Comedy | ⭐ 8.5 | 2019 |
| Gladiator | Action, Adventure, Drama | ⭐ 8.5 | 2000 |
| *...and 11 more* | | | |

### Games (21 Total)

| Title | Genre | Platform | Rating | Year |
|---|---|---|---|---|
| Red Dead Redemption 2 | Action, Adventure, Open World | PC/PS/Xbox | ⭐ 9.8 | 2018 |
| Portal 2 | Puzzle, Sci-Fi, Comedy | All Platforms | ⭐ 9.8 | 2011 |
| Baldur's Gate 3 | RPG, Fantasy | PC/PS/Xbox | ⭐ 9.8 | 2023 |
| The Witcher 3: Wild Hunt | RPG, Action, Fantasy | All Platforms | ⭐ 9.7 | 2015 |
| Elden Ring | RPG, Action, Dark Fantasy | PC/PS/Xbox | ⭐ 9.6 | 2022 |
| The Last of Us Part I | Action, Adventure | PC/PS | ⭐ 9.6 | 2022 |
| Disco Elysium | RPG, Detective, Indie | All Platforms | ⭐ 9.6 | 2019 |
| God of War Ragnarök | Action, Adventure | PlayStation | ⭐ 9.5 | 2022 |
| Persona 5 Royal | RPG, Anime, Turn-Based | All Platforms | ⭐ 9.5 | 2019 |
| The Legend of Zelda: BotW | Adventure, Action, Open World | Nintendo Switch | ⭐ 9.5 | 2017 |
| *...and 11 more* | | | | |

---

## 🔌 TMDB / RAWG API Migration Guide

When you're ready to upgrade from local data to live APIs, modify only the **3 fetch methods** inside `CinePlayAPI` in `js/app.js`:

```js
// CURRENT: Simulated local dataset fetch
async fetchMovies({ query, genre, sortBy, page, limit }) {
  await simulateNetworkDelay(250);
  let movies = window.moviesData ? [...window.moviesData] : [];
  // ...local filter & sort logic
}

// FUTURE: Live TMDB API fetch
async fetchMovies({ query, genre, sortBy, page, limit }) {
  const API_KEY = "YOUR_TMDB_API_KEY";
  const endpoint = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
    : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&page=${page}`;

  const res = await fetch(endpoint);
  const data = await res.json();

  return {
    results: data.results.map(item => ({
      id: `m${item.id}`,
      title: item.title,
      poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      genre: item.genre_ids.map(resolveGenreName),
      rating: item.vote_average,
      year: new Date(item.release_date).getFullYear(),
      description: item.overview,
      mood: [],
    })),
    total: data.total_results,
    hasMore: page < data.total_pages,
  };
}
```

> ✅ All page controllers, renderers, filters, and UI logic stay completely unchanged.

---

## 📋 Academic Compliance Checklist

| Requirement | Status |
|---|---|
| Semantic HTML5 page structure | ✅ Implemented |
| No inline CSS or JavaScript in HTML files | ✅ Implemented |
| Separate CSS files (style, responsive, animations) | ✅ Implemented |
| Modular JavaScript — one controller per page | ✅ Implemented |
| Reusable utility functions available globally | ✅ Implemented |
| Client-side data persistence (LocalStorage) | ✅ Implemented |
| Responsive design — mobile, tablet, desktop | ✅ Implemented |
| No backend, no database, no API key dependency | ✅ Implemented |
| Extendable to TMDB / RAWG API with minimal changes | ✅ Implemented |
| Decoupled data access from UI rendering layers | ✅ Implemented |
| Flexbox + CSS Grid layouts used throughout | ✅ Implemented |
| Accessibility attributes (aria-label, semantic tags) | ✅ Implemented |

---

## 👥 Development Team

| Member | Role | Key Contributions |
|---|---|---|
| **John Doe** | Frontend Architect | Design token system, CSS architecture, responsive layouts, animation system |
| **Jane Smith** | Lead JS Engineer | CinePlayAPI client, DOM renderers, recommendation engine, LocalStorage hooks |

---

## 📜 License

This project is developed for **academic and educational purposes** as part of a BCA programme curriculum. All movie and game titles referenced are properties of their respective owners and are used for demonstration purposes only.

---

<p align="center">
  Made with ❤️ as a BCA Mini Project<br>
  Powered by <b>HTML5 · CSS3 · Vanilla ES6+ JavaScript</b><br>
  Inspired by Netflix · Steam · IMDb
</p>
