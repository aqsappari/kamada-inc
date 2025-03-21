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

// New /admin route for login
router.get("/admin", (req, res) => {
  res.render("admin-login"); // Create an admin-login.ejs file
});

// New /admin post route for authentication
router.post("/admin", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Query Firestore for the user with the provided username.
    const usersRef = collection(db, "admins"); // Use a separate 'admins' collection
    const userDoc = doc(usersRef, username); // Use the username as the document ID.
    const docSnap = await getDoc(userDoc);

    // 2. Check if the user exists and the password matches.
    if (docSnap.exists()) {
      const adminData = docSnap.data();
      // In a real application, you should NEVER store passwords in plain text.
      //  Use a proper hashing algorithm like bcrypt.
      if (adminData.password === password) {
        // 3.  Successful authentication.
        //   You might want to set a session here to keep the user logged in.
        //   For this example, we'll just redirect to a success page.
        console.log("Admin logged in:", username);
        // Here, you might want to set up a session.  Example using express-session:
        req.session.isAdmin = true; //  Store session data
        res.redirect("/admin/dashboard"); //  redirect after successful login
      } else {
        // 4. Incorrect password.
        console.error("Incorrect password for user:", username);
        res.status(401).send("Incorrect password");
      }
    } else {
      // 5. User not found.
      console.error("User not found:", username);
      res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Error authenticating user");
  }
});

//  Example route for a protected admin dashboard
router.get("/admin/dashboard", (req, res) => {
  if (req.session && req.session.isAdmin) {
    //  If the user is authenticated, render the dashboard
    res.render("admin-dashboard");
  } else {
    //  Otherwise, redirect to the admin login page
    res.redirect("/admin");
  }
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
