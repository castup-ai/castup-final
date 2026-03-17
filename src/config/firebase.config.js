import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZVWqczpfoCvtCTa7ueV2nr5M7fBEi-Es",
  authDomain: "castupaiapp0.firebaseapp.com",
  projectId: "castupaiapp0",
  storageBucket: "castupaiapp0.firebasestorage.app",
  messagingSenderId: "749175327286",
  appId: "1:749175327286:web:bf14a3f00629d449586697",
  measurementId: "G-3Z6XVNQ5HE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
