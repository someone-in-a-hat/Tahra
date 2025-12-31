import { initializeApp } from "firebase/app";
import { collection, query, orderBy, limit, startAfter, getDocs, getFirestore } from "firebase/firestore"

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
const db = getFirestore(app);


const factsContainer = document.getElementById("quickFacts");
const factsInfo = document.getElementById("factsInfo");
const searchInput = document.getElementById("searchFactInput");

let currentPage = 1;
let lastVisible = null;
const PAGE_SIZE = 10;

async function loadQuickFacts(customQuery) {
    let q = customQuery || query(
        collection(db, "quickFacts"),
        orderBy("date", "desc"),
        limit(PAGE_SIZE)
    );

    if (currentPage > 1 && lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);

    factsContainer.innerHTML = "";

    const facts = [];
    snapshot.forEach(doc => {
        const fact = doc.data();
        fact.id = doc.id;
        facts.push(fact);
    });

    if (facts.length === 0) {
        factsContainer.innerHTML = "<p>لا توجد حقائق سريعة مطابقة.</p>";
        factsInfo.textContent = "";
        return;
    }

    // Render
    facts.forEach(fact => {
        const dateStr = fact.date?.toDate().toLocaleDateString('ar-EG') || "غير محدد";
        factsContainer.innerHTML += `
            <div class="fact-card">
                <img src="${fact.imageURL || 'placeholder.png'}" alt="icon">
                <div class="fact-content">
                    <h2><strong>الادعاء:</strong> ${fact.claim}</h2>
                    <p class="accuracy"><strong>الدقة:</strong> ${fact.accuracy}</p>
                    <h3><strong>التصحيح:</strong> ${fact.correction}</h3>
                    <p class="source"><strong>المصدر:</strong> <a href="${fact.source}" target="_blank">${fact.source}</a></p>
                    <p class="tag"><strong>التصنيف:</strong> ${fact.tag || 'عام'}</p>
                    <p class><strong>التاريخ:</strong> ${dateStr}</p>
                </div>
            </div>
        `;
    });

    factsInfo.textContent = `الصفحة ${currentPage} — ${facts.length} من أصل ${snapshot.size}`;

    lastVisible = snapshot.docs[snapshot.docs.length - 1];
    document.getElementById("prevFactBtn").disabled = currentPage === 1;
    document.getElementById("nextFactBtn").disabled = snapshot.size < PAGE_SIZE;
}

// Search
async function searchFacts() {
    const term = searchInput.value.trim();
    currentPage = 1;
    lastVisible = null;

    if (!term) {
        loadQuickFacts();
        return;
    }

    // Client-side search (OR tag/claim)
    const snapshot = await getDocs(collection(db, "quickFacts"));
    const filtered = [];
    snapshot.forEach(doc => {
        const fact = doc.data();
        fact.id = doc.id;
        if (fact.tag?.toLowerCase().includes(term.toLowerCase()) || fact.claim?.toLowerCase().includes(term.toLowerCase())) {
            filtered.push(fact);
        }
    });

    // Sort by date descending
    filtered.sort((a, b) => b.date.toDate() - a.date.toDate());

    factsContainer.innerHTML = "";
    filtered.slice(0, PAGE_SIZE).forEach(fact => {
        const dateStr = fact.date?.toDate().toLocaleDateString('ar-EG') || "غير محدد";
        factsContainer.innerHTML += `
            <div class="fact-card">
                <img src="${fact.imageURL || 'placeholder.png'}" alt="icon">
                <div class="fact-content">
                    <h2><strong>الادعاء:</strong> ${fact.claim}</h2>
                    <p class="accuracy"><strong>الدقة:</strong> ${fact.accuracy}</p>
                    <h3><strong>التصحيح:</strong> ${fact.correction}</h3>
                    <p class="source"><strong>المصدر:</strong> <a href="${fact.source}" target="_blank">${fact.source}</a></p>
                    <p class="tag"><strong>التصنيف:</strong> ${fact.tag || 'عام'}</p>
                    <p class><strong>التاريخ:</strong> ${dateStr}</p>
                </div>
            </div>
        `;
    });

    factsInfo.textContent = `الصفحة ${currentPage} — ${filtered.length} نتيجة`;
    document.getElementById("prevFactBtn").disabled = true;
    document.getElementById("nextFactBtn").disabled = filtered.length <= PAGE_SIZE;
}

// Navigation
function nextPageFacts() {
    if (document.getElementById("nextFactBtn").disabled) return;
    currentPage++;
    loadQuickFacts();
}

function prevPageFacts() {
    if (currentPage === 1) return;
    currentPage--;
    loadQuickFacts();
}

window.nextPageFacts = nextPageFacts;
window.prevPageFacts = prevPageFacts;

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchFacts();
});

// Initial load
loadQuickFacts();