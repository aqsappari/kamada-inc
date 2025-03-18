const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyC5HoNynEwPaHzdnmpTRKgafVaoSf8clzA",
  authDomain: "kamadazc.firebaseapp.com",
  projectId: "kamadazc",
  storageBucket: "kamadazc.firebasestorage.app",
  messagingSenderId: "557433410509",
  appId: "1:557433410509:web:7981999dd6b48d2eba6a84",
  measurementId: "G-18NC6K0DKE",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

module.exports = auth;
