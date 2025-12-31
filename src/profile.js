import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {   
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    where
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// --- Firebase config ---
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

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
let currentUser = null;

// --- Get profile ID from URL ---
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// --- Convert image URL to Base64 string ---
async function imageUrlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --- Load user's articles ---
async function loadUserArticles(userId) {
  const q = query(
    collection(db, "articles"),
    where("author_id", "==", userId),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  document.getElementById("articleCount").textContent = snapshot.size;

  const container = document.getElementById("articles");
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const article = docSnap.data();
    let date = article.date;

    if (date && date.toDate) date = date.toDate();
    else date = new Date(date);

    const formattedDate = date.toLocaleDateString('ar-EG');

    container.innerHTML += `
      <div class="article-card">
        <h3>
          <a href="article.html?id=${docSnap.id}">
            ${article.title}
          </a>
        </h3>
        <p>${formattedDate}</p>
      </div>
    `;
  });

  document.getElementById("articleInfo").textContent =
    snapshot.size > 0
      ? `عدد المقالات: ${snapshot.size}`
      : "لا يوجد مقالات بعد";
}

// --- Change username ---
async function changeUsername(uid) {
  const newName = document.getElementById("newUsername").value.trim();
  if (newName.length < 3) {
    alert("الاسم قصير جدًا");
    return;
  }
  await updateDoc(doc(db, "users", uid), { displayName: newName });
  document.getElementById("title").textContent = newName;
  alert("تم تحديث الاسم بنجاح");
}

async function isAdmin(userId) {
  try {
    const adminRef = doc(db, "admins", "admins");
    const snap = await getDoc(adminRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    const userIDs = data.UserIDs || [];
    return userIDs.includes(userId);
  } catch (err) {
    console.error("Error checking admin:", err);
    return false;
  }
}

async function checkAdminAccess(userId) {
  return isAdmin(userId);
}

async function enableOwnerControls(user) {
  const controls = document.getElementById("ownerControls");
  controls.style.display = "block";

  document.getElementById("newUsername").value =
    document.getElementById("title").textContent;

  document.getElementById("saveName")
    .addEventListener("click", () => changeUsername(user.uid));

  const hasAdminAccess = await checkAdminAccess(user.uid);
  if (hasAdminAccess) {
    const adminLink = document.createElement("a");
    adminLink.href = "admin.html";
    adminLink.textContent = "صفحة الإدارة";
    adminLink.classList.add("admin-link");
    controls.appendChild(adminLink);
  }
}

async function loadProfile() {

  onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user && user.uid === id) {
      await enableOwnerControls(user);
    }

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const profile = snap.data() || {};

      if (user.photoURL && !profile.photoBase64) {
        try {
          const base64 = await imageUrlToBase64(user.photoURL);
          await updateDoc(userRef, { photoBase64: base64 });
          console.log("Base64 profile photo saved");
        } catch (err) {
          console.error("Error converting photo to Base64:", err);
        }
      }
    }
  });

  if (!id) {
    document.getElementById("title").textContent = "حدث خطأ ما";
    return;
  }

  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    document.getElementById("title").textContent = "404 ملف شخصي غير موجود";
    return;
  }

  const profile = snap.data();

  document.getElementById("title").textContent = profile.displayName;

  if (profile.joinDate) {
    const date = new Date(profile.joinDate);
    document.getElementById("joinDate").textContent = date.toLocaleDateString('ar-EG');
  }

  const img = document.getElementById("avatar");
  if (profile.photoBase64) {
    img.src = profile.photoBase64;
    img.style.display = "block";
  } else if (profile.photoURL) {
    img.src = profile.photoURL;
    img.style.display = "block";
  }

  if (await isAdmin(id)) {
    const adminBadge = document.createElement("span");
    adminBadge.textContent = " (مشرف 🛠)";
    adminBadge.style.color = "red";
    adminBadge.style.fontWeight = "bold";
    document.getElementById("title").appendChild(adminBadge);
  }

  loadUserArticles(id);
}

loadProfile();
