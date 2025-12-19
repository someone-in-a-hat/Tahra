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
    doc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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

async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const docRef = doc(db, "articles", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        document.getElementById("title").textContent = "Article not found";
        return;
    }

    const article = snap.data();
    const date = article.date.toDate();

    document.getElementById("title").textContent = article.title;
    document.getElementById("date").textContent = date.toLocaleDateString();
    document.getElementById("content").textContent = article.content;
    const sourcesList = document.getElementById("sources");
    sourcesList.innerHTML = "";

    article.sources.forEach(url => {
        const li = document.createElement("li");

        const link = document.createElement("a");
        link.href = url;
        link.textContent = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        li.appendChild(link);
        sourcesList.appendChild(li);
    });

}

loadArticle();
