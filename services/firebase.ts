import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbt00ZK5toCSJ0MNHBkbWdN7cSjrpLO3g",
  authDomain: "pintando-7.firebaseapp.com",
  projectId: "pintando-7",
  storageBucket: "pintando-7.firebasestorage.app",
  messagingSenderId: "642108839044",
  appId: "1:642108839044:web:e0e06cfe8825287fc75ed1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };