import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {   
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    startAt,
    endAt } from "firebase/firestore";


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
let pageCursors = [];
let currentPage = 1;
let lastVisible = null;
const PAGE_SIZE = 10;




// async function getTotalArticles() {
//     const coll = collection(db, "articles");
//     const snapshot = await getCountFromServer(coll);
//     return snapshot.data().count;
//   }

  async function loadArticles(customQuery) {
    let q = customQuery || query(
        collection(db, "articles"),
        orderBy("date", "desc"),
        limit(PAGE_SIZE)
    );

    if (currentPage > 1 && lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    document.getElementById("nextBtn").disabled = snapshot.size < PAGE_SIZE;

    document.getElementById("articles").innerHTML = "";

    snapshot.forEach(doc => {
        const article = doc.data();
        const date = article.date.toDate();
        const formattedDate = date.toLocaleDateString();
        console.log(article.author_id)
        document.getElementById("articles").innerHTML += `
            <div class="article-card">
                <h3><a href="article.html?id=${doc.id}">${article.title}</a></h3>
                <p>${formattedDate}</p>
                <p><a href="profile.html?id=${article.author_id}">تأليف ${article.author}</a></p>
            </div>
        `;
    });

    const total = snapshot.size;
    document.getElementById("articleInfo").textContent =
        `الصفحه ${currentPage} — ${snapshot.size} من اصل ${total}`;

    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    document.getElementById("prevBtn").disabled = currentPage === 1;
}


  async function searchArticles() {
    const searchTerm = document.getElementById("searchInput").value.trim();
    currentPage = 1;
    pageCursors = [];
    lastVisible = null;

    let q;

    if (searchTerm === "") {
        q = query(
            collection(db, "articles"),
            orderBy("date", "desc"),
            limit(PAGE_SIZE)
        );
    } else {
        const endTerm = searchTerm + '\uf8ff';
        q = query(
            collection(db, "articles"),
            orderBy("title"),
            startAt(searchTerm),
            endAt(endTerm),
            limit(PAGE_SIZE)
        );
    }

    loadArticles(q);
}

  loadArticles();

function nextPage() {
    if (document.getElementById("nextBtn").disabled) return;

    currentPage++;
    loadArticles();
}

function prevPage() {
    if (currentPage === 1) return;

    currentPage--;
    loadArticles();
  }

window.nextPage = nextPage;
window.prevPage = prevPage;

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchArticles();
    }
});
