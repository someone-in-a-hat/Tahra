// import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
// import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//     apiKey: "AIzaSyCFRsEOAv57VH2SvyXcxOvaHYtobeb5ihQ",
//     authDomain: "test-1e3e5.firebaseapp.com",
//     databaseURL: "https://test-1e3e5-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "test-1e3e5",
//     storageBucket: "test-1e3e5.firebasestorage.app",
//     messagingSenderId: "72363023240",
//     appId: "1:72363023240:web:46e9bc35ef4a4aa31ff83d",
//     measurementId: "G-EBGKHLJDTV"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// import { getAuth, onAuthStateChanged } from "firebase/auth";

// const auth = getAuth();

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         console.log("Logged in as:", user.displayName);
//         // User is logged in — allow writing
//     } else {
//         // Not logged in — redirect to login page
//         console.log("Not Logged in");
//     }
// });



// const mockAuthors = [
//     "Alex Morgan",
//     "Jamie Lee",
//     "Chris Novak",
//     "Taylor Reed",
//     "Jordan Blake"
// ];

// const mockTitles = [
//     "10 Reasons Why X Is Better Than Y",
//     "The Truth Behind the Latest Rumor",
//     "What People Are Getting Wrong About This",
//     "An Honest Breakdown of the Situation",
//     "Why This Claim Is Spreading So Fast",
//     "Fact-Checking a Viral Story",
//     "What We Know So Far",
//     "Separating Facts From Fiction",
//     "A Closer Look at the Evidence",
//     "Explaining the Rumor in Simple Terms"
// ];

// const mockSources = [
//     "https://example.com/source1",
//     "https://example.com/source2",
//     "https://example.com/source3"
// ];

// function randomFrom(array) {
//     return array[Math.floor(Math.random() * array.length)];
// }

// async function addMockArticles() {
//     const articlesRef = collection(db, "articles");

//     for (let i = 0; i < 10; i++) {
//         await addDoc(articlesRef, {
//             title: randomFrom(mockTitles),
//             author: randomFrom(mockAuthors),
//             content: "This is mock article content used for testing the layout, pagination, and search functionality.",
//             sources: mockSources,
//             date: serverTimestamp()
//         });
//     }

//     console.log("✅ 10 mock articles added");
// }

// addMockArticles();
