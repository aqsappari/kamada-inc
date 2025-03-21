import express from "express";
import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { app, db } from "../firebase/firebaseApp.js"; // Import app and db
import bodyParser from "body-parser";

const router = express.Router();
const auth = getAuth(app); // Pass the app
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/logout", async (req, res) => {
  try {
    await signOut(auth);
    // Clear session on logout
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/"); // Redirect to index after logout
    });
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
