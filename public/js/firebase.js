import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5HoNynEwPaHzdnmpTRKgafVaoSf8clzA",
  authDomain: "kamadazc.firebaseapp.com",
  projectId: "kamadazc",
  storageBucket: "kamadazc.firebasestorage.app",
  messagingSenderId: "557433410509",
  appId: "1:557433410509:web:7981999dd6b48d2eba6a84",
  measurementId: "G-18NC6K0DKE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Export Firebase services
export { app, auth, provider };
