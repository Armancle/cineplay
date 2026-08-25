/* CinePlay - Authentication and Cloud Sync Manager */

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  setupAuthListeners();
});

// Current user state
let currentUser = null;

// Initialize the Auth UI placeholders
function initAuthUI() {
  const authContainers = document.querySelectorAll("#auth-container");
  if (authContainers.length === 0) return;

  authContainers.forEach(container => {
    container.innerHTML = `
      <div class="auth-wrapper">
        <button id="nav-login-btn" class="nav-auth-btn btn btn-outline" aria-label="Sign In with Google">
          <i class="fa-brands fa-google"></i> <span>Login</span>
        </button>
        <div id="nav-user-badge" class="user-profile" style="display: none;">
          <img id="nav-user-avatar" class="user-avatar" src="" alt="User Avatar">
          <span id="nav-user-name" class="user-name"></span>
          <button id="nav-logout-btn" class="logout-btn" title="Logout" aria-label="Logout">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    `;

    // Add click listeners
    const loginBtn = container.querySelector("#nav-login-btn");
    const logoutBtn = container.querySelector("#nav-logout-btn");

    if (loginBtn) loginBtn.addEventListener("click", login);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  });
}

// Setup state listeners for Firebase or Mock Auth
function setupAuthListeners() {
  if (window.useFirebase) {
    // Ensure persistence is set to LOCAL
    try {
      window.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (e) {
      console.warn("Persistence setting error:", e);
    }

    // Handle return from redirect (crucial for mobile devices)
    window.firebaseAuth.getRedirectResult()
      .then(async (result) => {
        if (result && result.user) {
          currentUser = result.user;
          updateUIForLoggedInUser(result.user.displayName, result.user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop");
          await syncFavoritesOnLogin(result.user.uid);
          window.CinePlay.showToast(`Welcome back, ${result.user.displayName}!`, "fa-solid fa-circle-user");
        }
      })
      .catch((error) => {
        if (error.code && error.code !== "auth/null-user" && error.code !== "auth/credential-already-in-use") {
          console.warn("Redirect result error:", error);
        }
      });

    // Listen to continuous auth state changes
    window.firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        currentUser = user;
        updateUIForLoggedInUser(user.displayName, user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop");
        await syncFavoritesOnLogin(user.uid);
      } else {
        currentUser = null;
        updateUIForLoggedOutUser();
      }
    });
  } else {
    // Check local storage for mock user session
    const savedMockUser = localStorage.getItem("cineplay_mock_user");
    if (savedMockUser) {
      try {
        const user = JSON.parse(savedMockUser);
        currentUser = user;
        updateUIForLoggedInUser(user.displayName, user.photoURL);
        syncFavoritesOnLogin(user.uid);
      } catch (e) {
        console.error("Error parsing mock user", e);
      }
    } else {
      currentUser = null;
      updateUIForLoggedOutUser();
    }
  }
}

// Update UI to logged-in state
function updateUIForLoggedInUser(name, photoURL) {
  const loginBtns = document.querySelectorAll("#nav-login-btn");
  const userBadges = document.querySelectorAll("#nav-user-badge");
  const avatars = document.querySelectorAll("#nav-user-avatar");
  const names = document.querySelectorAll("#nav-user-name");

  loginBtns.forEach(btn => btn.style.display = "none");
  userBadges.forEach(badge => badge.style.display = "flex");
  avatars.forEach(avatar => avatar.src = photoURL);
  names.forEach(n => n.textContent = name ? name.split(" ")[0] : "User");
}

// Update UI to logged-out state
function updateUIForLoggedOutUser() {
  const loginBtns = document.querySelectorAll("#nav-login-btn");
  const userBadges = document.querySelectorAll("#nav-user-badge");

  loginBtns.forEach(btn => btn.style.display = "flex");
  userBadges.forEach(badge => badge.style.display = "none");
}

// Trigger Google Login
function login() {
  if (window.useFirebase) {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Try popup first (fastest on desktop and supported mobile browsers)
    window.firebaseAuth.signInWithPopup(provider)
      .then((result) => {
        if (result && result.user) {
          window.CinePlay.showToast(`Welcome back, ${result.user.displayName}!`, "fa-solid fa-circle-user");
        }
      })
      .catch((error) => {
        console.error("Firebase Login Error:", error);
        
        // If popup is blocked or fails on mobile browser due to popup restrictions, fallback to redirect
        if (
          error.code === "auth/popup-blocked" || 
          error.code === "auth/cancelled-popup-request" ||
          error.code === "auth/popup-closed-by-user"
        ) {
          window.CinePlay.showToast("Opening secure Google Sign-In...", "fa-brands fa-google");
          window.firebaseAuth.signInWithRedirect(provider).catch(e => {
            console.error("Redirect fallback error:", e);
            window.CinePlay.showToast("Login failed. Check authorized domains in Firebase.", "fa-solid fa-circle-exclamation");
          });
        } else if (error.code === "auth/unauthorized-domain") {
          window.CinePlay.showToast("Domain not authorized in Firebase Console Settings.", "fa-solid fa-triangle-exclamation");
        } else {
          window.CinePlay.showToast("Login issue: " + (error.message || "Please try again"), "fa-solid fa-circle-exclamation");
        }
      });
  } else {
    showMockAuthPopup();
  }
}

// Trigger Sign Out
function logout() {
  if (confirm("Are you sure you want to log out? Your favorites will remain saved in the cloud.")) {
    if (window.useFirebase) {
      window.firebaseAuth.signOut().then(() => {
        // Clear local storage favorites on logout so they don't leak
        localStorage.removeItem("cineplay_favorites");
        window.dispatchEvent(new Event("favoritesChanged"));
        window.CinePlay.showToast("Logged out successfully", "fa-solid fa-right-from-bracket");
      });
    } else {
      localStorage.removeItem("cineplay_mock_user");
      localStorage.removeItem("cineplay_favorites");
      currentUser = null;
      updateUIForLoggedOutUser();
      window.dispatchEvent(new Event("favoritesChanged"));
      window.CinePlay.showToast("Logged out (Mock Mode)", "fa-solid fa-right-from-bracket");
    }
  }
}

// Sync local wishlist with cloud/mock database upon login
async function syncFavoritesOnLogin(uid) {
  let localFavs = JSON.parse(localStorage.getItem("cineplay_favorites")) || [];
  let cloudFavs = [];

  if (window.useFirebase) {
    try {
      const docRef = window.firebaseDb.collection("users").doc(uid);
      const doc = await docRef.get();
      if (doc.exists) {
        cloudFavs = doc.data().favorites || [];
      }
    } catch (e) {
      console.error("Error reading favorites from Firestore", e);
    }
  } else {
    // Read from Mock user favorites in local storage
    const mockDbFavs = localStorage.getItem(`cineplay_favorites_mock_${uid}`);
    if (mockDbFavs) {
      cloudFavs = JSON.parse(mockDbFavs);
    }
  }

  // Merge items (preserving uniqueness by id)
  let mergedFavs = [...cloudFavs];
  localFavs.forEach(localItem => {
    if (!mergedFavs.some(cloudItem => cloudItem.id === localItem.id)) {
      mergedFavs.push(localItem);
    }
  });

  // Save the merged data back to the database
  if (window.useFirebase) {
    try {
      await window.firebaseDb.collection("users").doc(uid).set({ favorites: mergedFavs }, { merge: true });
    } catch (e) {
      console.error("Error writing favorites to Firestore on sync", e);
    }
  } else {
    localStorage.setItem(`cineplay_favorites_mock_${uid}`, JSON.stringify(mergedFavs));
  }

  // Save back to local storage and notify app layers
  localStorage.setItem("cineplay_favorites", JSON.stringify(mergedFavs));
  window.dispatchEvent(new Event("favoritesChanged"));
}

// Save active wishlist to the database (triggered by actions)
async function syncFavoritesToCloud(favorites) {
  if (!currentUser) return;

  if (window.useFirebase) {
    try {
      await window.firebaseDb.collection("users").doc(currentUser.uid).set({ favorites }, { merge: true });
    } catch (e) {
      console.error("Error syncing favorites to Firestore", e);
    }
  } else {
    localStorage.setItem(`cineplay_favorites_mock_${currentUser.uid}`, JSON.stringify(favorites));
  }
}

// Helper: Show custom Mock Sign-In Modal Popup
function showMockAuthPopup() {
  // Check if mock modal already exists in document
  let modal = document.getElementById("mock-auth-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mock-auth-modal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width: 420px; padding: 40px 30px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
        <button class="modal-close" id="mock-auth-close-btn" style="position: absolute; top: 15px; right: 15px;"><i class="fa-solid fa-xmark"></i></button>
        <div style="font-size: 45px; color: var(--accent-red); margin-bottom: 5px;">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Google Sign-In Simulator</h2>
        <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
          This runs in <strong>Mock Mode</strong> because Firebase settings are not yet configured. Sign in to simulate saving your favorites securely to the cloud.
        </p>
        <button class="btn btn-primary" id="mock-signin-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 24px; border-radius: 30px; font-weight: 600; cursor: pointer;">
          <i class="fa-brands fa-google"></i> Sign In with Google
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#mock-auth-close-btn").addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });

    modal.querySelector("#mock-signin-btn").addEventListener("click", () => {
      const mockUserObj = {
        uid: "mock123_popcorn_lover",
        displayName: "Popcorn Lover",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
      };
      localStorage.setItem("cineplay_mock_user", JSON.stringify(mockUserObj));
      currentUser = mockUserObj;
      updateUIForLoggedInUser(mockUserObj.displayName, mockUserObj.photoURL);
      
      modal.classList.remove("active");
      
      // Load favorites and sync
      syncFavoritesOnLogin(mockUserObj.uid);
      window.CinePlay.showToast("Welcome! Signed in as Popcorn Lover (Mock)", "fa-solid fa-circle-user");
    });
  }

  modal.classList.add("active");
}

// Export auth references
window.CinePlayAuth = {
  getCurrentUser: () => currentUser,
  isLoggedIn: () => currentUser !== null,
  syncFavoritesToCloud
};
