import express from "express";
import { db } from "../firebase/firebaseApp.js"; // Import db
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Import Firestore functions
import bodyParser from "body-parser";
import session from "express-session"; // Import express-session

const adminRouter = express.Router();
adminRouter.use(bodyParser.urlencoded({ extended: false }));

// Session configuration (IMPORTANT: Configure this middleware)
adminRouter.use(
  session({
    secret: "your-secret-key", // Replace with a strong, random secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production if using HTTPS
  })
);

// Declare verifyLogin
async function verifyLogin(enteredUsername, enteredPassword) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", enteredUsername));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("User not found.");
      return { success: false, message: "User not found" }; // Return an error object
    }

    // Assuming username is unique, get the first document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // WARNING: NEVER store passwords like this in a real app!
    if (userData.password === enteredPassword) {
      console.log("Login successful!");
      return { success: true, userData }; // Return success with user data
    } else {
      console.log("Incorrect password.");
      return { success: false, message: "Incorrect password" }; // Return an error object
    }
  } catch (error) {
    console.error("Error verifying login:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

adminRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await verifyLogin(username, password); // Await the result

    if (result.success) {
      // Set session variables
      req.session.username = username;
      req.session.isAdmin = true; //  You might still want to get this from the database

      console.log("Login successful - redirecting to dashboard");
      res.redirect("/admin/dashboard");
    } else {
      console.log("Login failed - redirecting to login page with error");
      // Use req.session.errorMessage to pass the error message
      req.session.errorMessage = result.message;
      res.redirect("/admin"); // Redirect back to the login page
    }
  } catch (error) {
    console.error("Error in post handler:", error);
    res.status(500).send("Internal Server Error");
  }
});

adminRouter.get("/dashboard", (req, res) => {
  if (req.session && req.session.isAdmin) {
    console.log("Dashboard access granted");
    res.render("admin-dashboard");
  } else {
    console.log("Dashboard access denied - redirecting to login");
    res.redirect("/admin");
  }
});

adminRouter.get("/", (req, res) => {
  // Render the admin login page.  Pass the error message to the template.
  console.log();

  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage; // Clear the error message after displaying it *once*
  res.render("login", { errorMessage }); //  Pass errorMessage to the template
});

export default adminRouter;
