import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {   
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

  snapshot.forEach(doc => {
    const article = doc.data();
    const date = article.date.toDate();
    const formattedDate = date.toLocaleDateString();

    container.innerHTML += `
      <div class="article-card">
        <h3>
          <a href="article.html?id=${doc.id}">
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

async function changeUsername(uid) {
  const newName = document
    .getElementById("newUsername")
    .value
    .trim();

  if (newName.length < 3) {
    alert("الاسم قصير جدًا");
    return;
  }

  await updateDoc(doc(db, "users", uid), {
    displayName: newName
  });

  document.getElementById("title").textContent = newName;
  alert("تم تحديث الاسم بنجاح");
}

function enableOwnerControls(user) {
  const controls = document.getElementById("ownerControls");
  controls.style.display = "block";

  document.getElementById("newUsername").value =
    document.getElementById("title").textContent;

  document
    .getElementById("saveName")
    .addEventListener("click", () =>
      changeUsername(user.uid)
    );
}

async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    onAuthStateChanged(auth, user => {
      if (user && user.uid === id) {
        enableOwnerControls(user);
      }
    });
  
    if (!id) {
      document.getElementById("title").textContent = "Invalid profile";
      return;
    }
  
    const ref = doc(db, "users", id);
    const snap = await getDoc(ref);
  
    if (!snap.exists()) {
      document.getElementById("title").textContent = "404 Profile not found";
      return;
    }
  
    const profile = snap.data();
  
    document.getElementById("title").textContent = profile.displayName;
  
    if (profile.joinDate) {
      const date = new Date(profile.joinDate);
      document.getElementById("joinDate").textContent = date.toLocaleDateString();
    }
  
    if (profile.photoURL) {
      const img = document.getElementById("avatar");
      img.src = profile.photoURL;
      img.style.display = "block";
    }
    loadUserArticles(id);
  }

  loadProfile();
  