import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
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
const auth = getAuth(app);


async function canSubmitAgain(collectionName, cooldownMinutes = 15) {
    const q = query(
      collection(db, collectionName),
      where("author_id", "==", currentUser.uid),
      orderBy("date", "desc"),
      limit(1)
    );
  
    const snapshot = await getDocs(q);
  
    if (snapshot.empty) {
      return true; // No previous submissions
    }
  
    const lastDoc = snapshot.docs[0].data();
    if (!lastDoc.date) return true;
  
    const lastTime = lastDoc.date.toDate().getTime();
    const now = Date.now();
  
    const diffMinutes = (now - lastTime) / (1000 * 60);
  
    return diffMinutes >= cooldownMinutes;
  }



  const contentType = document.getElementById("contentType");
  const articleForm = document.getElementById("articleForm");
  const quickFactForm = document.getElementById("quickFactForm");
  const submitBtn = document.getElementById("submitContentBtn");
  const statusEl = document.getElementById("submitStatus");
  
  contentType.addEventListener("change", () => {
    articleForm.hidden = contentType.value !== "article";
    quickFactForm.hidden = contentType.value !== "quickfact";
  });
  
  let currentUser = null;
  let authorName = "مستخدم";
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      statusEl.textContent = "يرجى تسجيل الدخول أولاً";
      submitBtn.disabled = true;
      return;
    }
  
    currentUser = user;
    submitBtn.disabled = false;
  
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
      authorName = userSnap.data().displayName || authorName;
    }
  });
  
  submitBtn.addEventListener("click", async () => {
    if (!currentUser) return;
  
    submitBtn.disabled = true;
    statusEl.textContent = "جاري التحقق...";
  
    try {
      const collectionName =
        contentType.value === "article"
          ? "pendingarticles"
          : "pendingquickFacts";
  
      const allowed = await canSubmitAgain(collectionName, 15);
  
      if (!allowed) {
        statusEl.textContent =
          "يمكنك إرسال محتوى جديد كل 15 دقيقة فقط";
        submitBtn.disabled = false;
        return;
      }
  
      statusEl.textContent = "جاري الإرسال...";
  
      if (contentType.value === "article") {
        await submitArticle();
      } else {
        await submitQuickFact();
      }
  
      statusEl.textContent = "تم الإرسال بنجاح — بانتظار المراجعة";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "حدث خطأ أثناء الإرسال";
    }
  
    submitBtn.disabled = false;
  });
  
  
  async function submitArticle() {
    const id = crypto.randomUUID();
  
    const sources = document
      .getElementById("articleSources")
      .value
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);
  
    await setDoc(doc(db, "pendingarticles", id), {
      title: document.getElementById("articleTitle").value,
      content: document.getElementById("articleContent").value,
      sources,
  
      author: authorName,
      author_id: currentUser.uid,
  
      status: "pending",
      reason: "",
  
      date: serverTimestamp()
    });
  }
  
  async function submitQuickFact() {
    const id = crypto.randomUUID();
    const accuracy = document.getElementById("factAccuracy").value;
  
    const imageURL =
      accuracy === "خاطئ"
        ? "red-x-icon.png"
        : "questionmark.png";
  
    await setDoc(doc(db, "pendingquickFacts", id), {
      claim: document.getElementById("factClaim").value,
      correction: document.getElementById("factCorrection").value,
      accuracy,
      tag: document.getElementById("factTag").value,
      source: document.getElementById("factSource").value,
      imageURL,
  
      author: authorName,
      author_id: currentUser.uid,
  
      status: "pending",
      reason: "",
  
      date: serverTimestamp()
    });
  }
  async function loadUserSubmissions() {
    if (!currentUser) return;

    const submissionsContainer = document.getElementById("submissionList");
    submissionsContainer.innerHTML = "<p>جاري تحميل مساهماتك...</p>";

    try {
        // --- Query pending articles ---
        const articlesQuery = query(
            collection(db, "pendingarticles"),
            where("author_id", "==", currentUser.uid),
            orderBy("date", "desc")
        );
        const articlesSnap = await getDocs(articlesQuery);

        const articleSubmissions = articlesSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: "مقال",
                titleOrClaim: data.title || "بدون عنوان",
                status: data.status || "pending",
                date: data.date?.toDate() || new Date(),
                reason: data.reason || ""
            };
        });

        // --- Query pending quick facts ---
        const factsQuery = query(
            collection(db, "pendingquickFacts"),
            where("author_id", "==", currentUser.uid),
            orderBy("date", "desc")
        );
        const factsSnap = await getDocs(factsQuery);

        const factSubmissions = factsSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: "حقيقة سريعة",
                titleOrClaim: data.claim || "بدون ادعاء",
                status: data.status || "pending",
                date: data.date?.toDate() || new Date(),
                reason: data.reason || ""
            };
        });

        // --- Merge and sort ---
        const allSubmissions = [...articleSubmissions, ...factSubmissions];
        allSubmissions.sort((a, b) => b.date - a.date);

        // --- Render ---
        if (allSubmissions.length === 0) {
            submissionsContainer.innerHTML = "<p>لم تقم بإرسال أي مساهمات بعد.</p>";
            return;
        }

        submissionsContainer.innerHTML = ""; // clear placeholder

        allSubmissions.forEach(sub => {
            const statusIcon =
                sub.status === "approved" ? "✅" :
                sub.status === "rejected" ? "❌" :
                "⏳";

            const statusText =
                sub.status === "approved" ? "تم القبول" :
                sub.status === "rejected" ? "مرفوض" :
                "قيد المراجعة";

            const reasonHTML = sub.status === "rejected" && sub.reason
                ? `<p><strong>السبب:</strong> ${sub.reason}</p>`
                : ""
            const dateStr = sub.date.toLocaleDateString('ar-EG') + " " + sub.date.toLocaleTimeString('ar-EG');

            submissionsContainer.innerHTML += `
                <div class="submission-card">
                    <p><strong>${statusIcon} ${sub.type}:</strong> ${sub.titleOrClaim}</p>
                    <p><strong>الحالة:</strong> ${statusText}</p>
                    <p><strong>التاريخ:</strong> ${dateStr}</p>
                    ${reasonHTML}
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        submissionsContainer.innerHTML = "<p>حدث خطأ أثناء تحميل مساهماتك.</p>";
    }
}

// Call it after auth is ready
onAuthStateChanged(auth, user => {
    if (user) {
        currentUser = user;
        loadUserSubmissions();
    }
});