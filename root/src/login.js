import { FirebaseError, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDoc, doc, setDoc, addDoc, getDocs } from "firebase/firestore";
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
const auth = getAuth();
const provider = new GoogleAuthProvider();


async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      joinDate: user.metadata.creationTime,
      photoURL: user.photoURL ?? null
    });
  }
}


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('button').addEventListener('click', function() {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          document.getElementById("message").textContent = "تم بنجاح !";
          document.getElementById("message").style.color = "green";
          console.log(user);
          ensureUserDoc(user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = error.credential;
          console.error(errorMessage);
        });
    });
  })

