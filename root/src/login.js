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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('button').addEventListener('click', function() {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          document.getElementById("message").textContent = "Success !";
          document.getElementById("message").style.color = "green";
          console.log(user);
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


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("send").addEventListener("submit", async function(event) {
    try {
    event.preventDefault();
    let username = document.getElementById("username").value;
    username = username.trim()
    const msg = document.getElementById("tstmsg").value;
    let docReference = collection(db, "messages", username, "UserMessages");
    await addDoc(docReference, { user: username, msg: msg })
  }
    catch (error){
      document.getElementById("result").style.color = "red";
      document.getElementById("result").textContent = "Firebase error: " + error.message;
    }
  })});

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("search").addEventListener("submit", async function(event) {
      event.preventDefault();
  
      // Get the message ID to search for
      let username = document.getElementById("searchmsg").value;

      username = username.trim(); // Still recommend trimming for robustness against whitespace
  
      // Ensure username is not empty before proceeding
      if (!username) {
        console.log("Please enter a valid search message.");
        document.getElementById("displaymsg").textContent = "Please enter a valid username.";
        return;
      }
  
      // Create a document reference for the "messages" collection with the ID being the message
      console.log("Type of db:", typeof db);
      console.log("Is db null or undefined?", db === null || db === undefined);
      console.log("The message ID being passed to doc():", username); // This is the most important log
      console.log("Type of message ID:", typeof username);
       // CORRECTED: Create a collection reference for the 'UserMessages' subcollection
    // The path is: 'messages' collection -> {username} document -> 'UserMessages' subcollection
    const userMessagesCollectionRef = collection(db, "messages", username, "UserMessages");

    try {
      // CORRECTED: Fetch all documents from the 'UserMessages' subcollection
      const querySnapshot = await getDocs(userMessagesCollectionRef);

      let messages = [];
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const messageData = doc.data();
          // Assuming 'msg' is a field directly in each document within UserMessages
          if (messageData && messageData.msg) {
            messages.push(messageData.msg);
            console.log(`Document ID: ${doc.id}, Message: ${messageData.msg}`);
          }
        });
        // Display all collected messages, or handle them as needed
        document.getElementById("displaymsg").textContent = "Messages found: " + messages.join(", ");
      } else {
          document.getElementById("displaymsg").textContent = "No message found!";
        }}
      catch (error) {
        console.error("Error fetching document:", error);
        document.getElementById("displaymsg").textContent = "Error fetching message!";
      }
    });
  });