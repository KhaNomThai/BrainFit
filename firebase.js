// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXe79TtxYUonqJrHMvqR8kyalVw9ZAhhw",
  authDomain: "myapp-76dcb.firebaseapp.com",
  projectId: "myapp-76dcb",
  storageBucket: "myapp-76dcb.firebasestorage.app",
  messagingSenderId: "9959004723",
  appId: "1:9959004723:web:8299f6f0d8244e1f962146",
  measurementId: "G-W0QGJ3HJ6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);