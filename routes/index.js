// routes/index.js
import express from "express";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { app, db } from "../firebase/firebaseApp.js"; // Import app and db
import bodyParser from "body-parser";

const router = express.Router();
const auth = getAuth(app); // Pass the app
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  const user = auth.currentUser;
  let isVerified = false;

  if (user) {
    await user.reload();
    isVerified = user.emailVerified;
  }

  res.render("index", { user: user, isVerified: isVerified });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await addDoc(collection(db, "users"), {
      uid: user.uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
    });

    // Send email verification
    await sendEmailVerification(user);

    console.log("User created and data stored:", user);
    res.render("verify-email", { email: email }); // Render the verify-email view
  } catch (error) {
    console.error("Error creating user or storing data:", error);
    res.status(500).send("Error creating user");
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  const user = auth.currentUser;

  if (user && user.email === email) {
    try {
      await sendEmailVerification(user);
      res.send("Verification email resent");
    } catch (error) {
      console.error("Error resending email:", error);
      res.status(500).send("Error resending email");
    }
  } else {
    res.status(400).send("Invalid request");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User logged in:", user);
    res.redirect("/");
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(401).send("Login failed");
  }
});

router.get("/logout", async (req, res) => {
  try {
    await signOut(auth);
    res.redirect("/"); // Redirect to index after logout
  } catch (error) {
    console.error("Error signing out:", error);
    res.status(500).send("Error signing out");
  }
});

router.get("/design-details", (req, res) => {
  res.render("design-details");
});

router.get("/checkout", (req, res) => {
  res.render("checkout");
});

export default router;
