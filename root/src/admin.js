import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, updateDoc, setDoc, query, orderBy, where } from "firebase/firestore";
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
const db = getFirestore(app);
const auth = getAuth();

async function checkAdmin(uid) {
    try {
        const adminDocRef = doc(db, "admins", "admins");
        const snap = await getDoc(adminDocRef);
        if (!snap.exists()) return false;
        const adminsArray = snap.data().UserIDs || [];
        return adminsArray.includes(uid);
    } catch (err) {
        console.error(err);
        return false;
    }
}

onAuthStateChanged(auth, async user => {
    if (!user) {
        alert("يجب تسجيل الدخول للوصول إلى صفحة الإدارة");
        location.href = "login.html";
        return;
    }

    const isAdmin = await checkAdmin(user.uid);
    if (!isAdmin) {
        alert("ليس لديك صلاحية الوصول لهذه الصفحة");
        return;
    }

    loadPendingArticles();
    loadPendingFacts();
});

// --- Load pending articles ---
async function loadPendingArticles() {
    const container = document.getElementById("pendingArticlesContainer");
    container.innerHTML = "";

    const q = query(
        collection(db, "pendingarticles"),
        where("status", "==", "pending"), // Only pending
        orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        container.innerHTML = "<p>لا توجد مقالات معلقة</p>";
        return;
    }

    snapshot.forEach(docSnap => {
        const article = docSnap.data();
        const card = document.createElement("div");
        card.className = "admin-card";

        card.innerHTML = `
            <h3>${article.title}</h3>
            <p><strong>المؤلف:</strong> ${article.author} | <strong>التاريخ:</strong> ${article.date?.toDate().toLocaleDateString('ar-EG') || "غير محدد"}</p>
            <p>${article.content}</p>
            <p><strong>المصادر:</strong> ${article.sources?.join(", ") || "-"}</p>
            <div class="admin-actions">
                <button class="approve-btn">اعتماد</button>
                <button class="reject-btn">رفض</button>
                <input type="text" placeholder="سبب الرفض..." class="reason-input">
            </div>
        `;

        const approveBtn = card.querySelector(".approve-btn");
        const rejectBtn = card.querySelector(".reject-btn");
        const reasonInput = card.querySelector(".reason-input");

        approveBtn.addEventListener("click", () => handleApproval(docSnap.id, article, true));
        rejectBtn.addEventListener("click", () => handleApproval(docSnap.id, article, false, reasonInput.value));

        container.appendChild(card);
    });
}

// --- Load pending facts ---
async function loadPendingFacts() {
    const container = document.getElementById("pendingFactsContainer");
    container.innerHTML = "";

    const q = query(
        collection(db, "pendingquickFacts"),
        where("status", "==", "pending"), // Only pending
        orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        container.innerHTML = "<p>لا توجد حقائق سريعة معلقة</p>";
        return;
    }

    snapshot.forEach(docSnap => {
        const fact = docSnap.data();
        const card = document.createElement("div");
        card.className = "admin-card";

        card.innerHTML = `
            <h3>${fact.claim}</h3>
            <p><strong>التصحيح:</strong> ${fact.correction} | <strong>الدقة:</strong> ${fact.accuracy}</p>
            <p><strong>المؤلف:</strong> ${fact.author} | <strong>التاريخ:</strong> ${fact.date?.toDate().toLocaleDateString('ar-EG') || "غير محدد"}</p>
            <p><strong>المصدر:</strong> ${fact.source || "-"}</p>
            <p><strong>التصنيف:</strong> ${fact.tag || "عام"}</p>
            <div class="admin-actions">
                <button class="approve-btn">اعتماد</button>
                <button class="reject-btn">رفض</button>
                <input type="text" placeholder="سبب الرفض..." class="reason-input">
            </div>
        `;

        const approveBtn = card.querySelector(".approve-btn");
        const rejectBtn = card.querySelector(".reject-btn");
        const reasonInput = card.querySelector(".reason-input");

        approveBtn.addEventListener("click", () => handleFactApproval(docSnap.id, fact, true));
        rejectBtn.addEventListener("click", () => handleFactApproval(docSnap.id, fact, false, reasonInput.value));

        container.appendChild(card);
    });
}

// --- Handle article approval/rejection ---
async function handleApproval(id, article, approved, reason = "") {
    try {
        if (approved) {
            const newDocRef = doc(db, "articles", id);
            await setDoc(newDocRef, { ...article, status: "approved" });
        }

        const pendingRef = doc(db, "pendingarticles", id);
        await updateDoc(pendingRef, { status: approved ? "approved" : "rejected", reason });

        alert(`تم ${approved ? "اعتماد" : "رفض"} المقال بنجاح`);
        loadPendingArticles();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ، حاول مرة أخرى");
    }
}

// --- Handle fact approval/rejection ---
async function handleFactApproval(id, fact, approved, reason = "") {
    try {
        if (approved) {
            const newDocRef = doc(db, "quickFacts", id);
            await setDoc(newDocRef, { ...fact, status: "approved" });
        }

        const pendingRef = doc(db, "pendingquickFacts", id);
        await updateDoc(pendingRef, { status: approved ? "approved" : "rejected", reason });

        alert(`تم ${approved ? "اعتماد" : "رفض"} الحقيقة بنجاح`);
        loadPendingFacts();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ، حاول مرة أخرى");
    }
}


async function loadAnalytics() {
    const analyticsContainer = document.getElementById("analytics");
    if (!analyticsContainer) return; // skip if container doesn't exist
  
    // --- Total users ---
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsers = usersSnap.size;
  
    // --- Total approved articles ---
    const approvedArticlesSnap = await getDocs(query(
      collection(db, "articles"),
      where("status", "==", "approved")
    ));
    const totalApprovedArticles = approvedArticlesSnap.size;
  
    // --- Total pending articles ---
    const pendingArticlesSnap = await getDocs(query(
      collection(db, "pendingarticles"),
      where("status", "==", "pending")
    ));
    const totalPendingArticles = pendingArticlesSnap.size;
  
    // --- Total approved quick facts ---
    const approvedFactsSnap = await getDocs(query(
      collection(db, "quickFacts"),
      where("status", "==", "approved")
    ));
    const totalApprovedFacts = approvedFactsSnap.size;
  
    // --- Total pending quick facts ---
    const pendingFactsSnap = await getDocs(query(
      collection(db, "pendingquickFacts"),
      where("status", "==", "pending")
    ));
    const totalPendingFacts = pendingFactsSnap.size;
  
    // --- Display analytics ---
    analyticsContainer.innerHTML = `
      <h2>إحصائيات</h2>
      <ul>
        <li>إجمالي المستخدمين: ${totalUsers}</li>
        <li>إجمالي المقالات المعتمدة: ${totalApprovedArticles}</li>
        <li>إجمالي المقالات المعلقة: ${totalPendingArticles}</li>
        <li>إجمالي الحقائق السريعة المعتمدة: ${totalApprovedFacts}</li>
        <li>إجمالي الحقائق السريعة المعلقة: ${totalPendingFacts}</li>
      </ul>
    `;
  }
  
  // Call it after checking admin
  onAuthStateChanged(auth, async user => {
    if (!user) return;
    const isAdminUser = await checkAdmin(user.uid);
    if (!isAdminUser) return;
  
    loadAnalytics();
  });
  