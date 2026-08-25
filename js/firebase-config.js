/* CinePlay - Firebase Configuration and Initialization 
 * 
 * =========================================================================
 * HOW TO SET UP FIREBASE CREDENTIALS FOR THIS SITE:
 * =========================================================================
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Click "Add Project" (or choose an existing project).
 * 3. Once inside, click the Web icon (</>) to register a new Web application.
 * 4. Choose a name (e.g. "CinePlay") and click "Register App".
 * 5. Copy the configuration object settings and paste them into the "firebaseConfig" variable below.
 * 
 * 6. Set up Auth:
 *    - In Firebase Console, go to "Build" -> "Authentication" in the left sidebar.
 *    - Click "Get Started" and select the "Sign-in method" tab.
 *    - Click "Add new provider", choose "Google", enable it, and click "Save".
 * 
 * 7. Set up Firestore Database (to sync favorites/wishlist):
 *    - In the sidebar, go to "Build" -> "Firestore Database".
 *    - Click "Create Database" -> select "Start in test mode" (or configuration rules) -> click "Create".
 * =========================================================================
 */

const firebaseConfig = {
    apiKey: "AIzaSyA3I7WtXvGAm9CbVZMz573jQmamp7x458w",
    authDomain: "cineplay-d3113.firebaseapp.com",
    projectId: "cineplay-d3113",
    storageBucket: "cineplay-d3113.firebasestorage.app",
    messagingSenderId: "333156274283",
    appId: "1:333156274283:web:b604d418e1f67d35e8a12e",
    measurementId: "G-V2H38LZLQG"
  };

let app = null;
let auth = null;
let db = null;
let useFirebase = false;

// Check if settings have been updated from defaults
if (
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
) {
  try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    useFirebase = true;
    console.log("Firebase initialized successfully in Production Mode.");
  } catch (error) {
    console.error("Error initializing Firebase: ", error);
  }
} else {
  console.warn("CinePlay running in MOCK AUTH MODE. Please configure real Firebase credentials in js/firebase-config.js to enable production Google Authentication.");
}

// Export variables to global scope
window.useFirebase = useFirebase;
window.firebaseAuth = auth;
window.firebaseDb = db;
