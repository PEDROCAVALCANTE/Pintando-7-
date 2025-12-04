import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

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

// Initialize Messaging
let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase Messaging not supported in this environment (likely due to http vs https or browser privacy settings).");
}

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get the token
      // Note: In production, you should provide a VAPID key: await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      // For now, we try without it or rely on default project config if generated in console.
      const token = await getToken(messaging);
      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};

export { auth, db, messaging, onMessage };