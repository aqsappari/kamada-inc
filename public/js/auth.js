import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { auth, provider, GoogleAuthProvider } from "./firebase";

const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");
const toggleSignup = document.getElementById("toggle-signup");
const toggleSignin = document.getElementById("toggle-signin");
const header = document.getElementById("header");

const googleSignup = document.getElementById("signup-google");
const googleSignin = document.getElementById("signin-google");

googleSignin.addEventListener("click", (e) => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
});

googleSignup.addEventListener("click", (e) => {
  googleSignin.click();
});

toggleSignup.addEventListener("click", (e) => {
  e.preventDefault();
  signinForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  header.innerText = "SIGN UP";
});

toggleSignin.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.add("hidden");
  signinForm.classList.remove("hidden");
  header.innerText = "SIGN IN";
});

document.getElementById("signin-button").addEventListener("click", () => {
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  if (!signinValidity(email, password)) {
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });

  console.log("Sign In:", email, password);
  // Add your actual sign-in logic here
});

document.getElementById("signup-button").addEventListener("click", () => {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  if (!signupValidity(name, email, password)) {
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });

  console.log("Sign Up:", name, email, password);
  // Add your actual sign-up logic here
});

/* 
    listed down below are the functions used
    to simplify the text up above 
  */

function signinValidity(email, password) {
  const emailError = document.getElementById("signin-email-error");
  const passwordError = document.getElementById("signin-password-error");

  if (!email) {
    emailError.innerText = "Email Required";
    emailError.classList.remove("hidden");
    return false;
  } else if (!isValidEmail(email)) {
    emailError.innerText = "Invalid Email";
    emailError.classList.remove("hidden");
    return false;
  } else {
    emailError.classList.add("hidden");
  }

  if (!password) {
    passwordError.innerText = "Password Required";
    passwordError.classList.remove("hidden");
    return false;
  } else {
    passwordError.classList.add("hidden");
  }

  return true;
}

function signupValidity(name, email, password) {
  const nameError = document.getElementById("signup-name-error");
  const emailError = document.getElementById("signup-email-error");
  const passwordError = document.getElementById("signup-password-error");

  if (!name) {
    nameError.classList.remove("hidden");
    return false;
  } else {
    nameError.classList.add("hidden");
  }

  if (!email) {
    emailError.innerText = "Email Required";
    emailError.classList.remove("hidden");
    return false;
  } else if (!isValidEmail(email)) {
    emailError.innerText = "Invalid Email";
    emailError.classList.remove("hidden");
    return false;
  } else {
    emailError.classList.add("hidden");
  }

  if (!password) {
    passwordError.innerText = "Password Required";
    passwordError.classList.remove("hidden");
    return false;
  } else if (!isValidPassword(password)) {
    passwordError.innerText = "Password must be at least 8 characters";
    passwordError.classList.remove("hidden");
    return false;
  } else {
    passwordError.classList.add("hidden");
  }

  return true;
}

function isValidEmail(email) {
  if (!email) {
    return false; // Return false if email is empty or null
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  if (!password) {
    return false; // Return false if password is empty or null
  }

  return password.length >= 8; // Return true if password length is 8 or more, false otherwise
}
