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
  apiKey: "AIzaSyDOdpuEGIoUHaqCSUg2jcbc1kwT6tT_EIU",
  authDomain: "testapp-a2597.firebaseapp.com",
  projectId: "testapp-a2597",
  storageBucket: "testapp-a2597.firebasestorage.app",
  messagingSenderId: "489261611782",
  appId: "1:489261611782:web:28794cf0b4994423f0fc87",
  measurementId: "G-SX4W4E0BKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);