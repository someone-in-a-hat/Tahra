// src/main.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCFRsEOAv57VH2SvyXcxOvaHYtobeb5ihQ",
    authDomain: "test-1e3e5.firebaseapp.com",
    databaseURL: "https://test-1e3e5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "test-1e3e5",
    storageBucket: "test-1e3e5.firebasestorage.app",
    messagingSenderId: "72363023240",
    appId: "1:72363023240:web:46e9bc35ef4a4aa31ff83d",
    measurementId: "G-EBGKHLJDTV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const nameEl = document.getElementById("userName");
const avatarEl = document.getElementById("userAvatar");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().displayName) {
      nameEl.textContent = "مرحبا " + snap.data().displayName;
    }
    if (user.photoURL) {
      avatarEl.src = user.photoURL;
      avatarEl.style.display = "block";
    }
  } else {
    nameEl.textContent = "لم يتم تسجيل الدخول";
    avatarEl.style.display = "none";
  }
});


avatarEl.addEventListener("click", () => {
    window.location.href = `profile.html?id=${auth.currentUser.uid}`;
  });