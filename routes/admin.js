import express from "express";
import { db } from "../firebase/firebaseApp.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import bodyParser from "body-parser";
import session from "express-session";
import { dashboardContent } from "./admin/admin-helper.js";
import productRouter from "./products.js";
import orderRouter from "./orders.js";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

async function verifyLogin(enteredUsername, enteredPassword) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", enteredUsername));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("User not found.");
      return { success: false, message: "User not found" };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password === enteredPassword) {
      console.log("Login successful!");
      return { success: true, userData };
    } else {
      console.log("Incorrect password.");
      return { success: false, message: "Incorrect password" };
    }
  } catch (error) {
    console.error("Error verifying login:", error);
    throw error;
  }
}

// Middleware to check if user is logged in for /admin/* routes
const checkAdminLogin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next(); // User is logged in, proceed
  } else {
    res.redirect("/admin"); // User is not logged in, redirect to login page
  }
};

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await verifyLogin(username, password);

    if (result.success) {
      req.session.username = username;
      req.session.isAdmin = true;

      console.log("Login successful - redirecting to dashboard");
      res.redirect("/admin/dashboard");
    } else {
      console.log("Login failed - redirecting to login page with error");
      req.session.errorMessage = result.message;
      res.redirect("/admin");
    }
  } catch (error) {
    console.error("Error in post handler:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/", (req, res) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render("login", { errorMessage });
});

// Apply checkAdminLogin middleware to all /admin/* routes except the root route
// router.use("/", checkAdminLogin);

router.get("/dashboard", (req, res) => {
  console.log("Dashboard access granted");
  try {
    const body = dashboardContent;
    const script = '<script src="/js/admin-dashboard.js"></script>';

    res.render("admin-template", {
      body: body,
      script: script,
      currentPage: "/admin/dashboard",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.use("/products", productRouter);

router.get("/get-products", async (req, res) => {
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id, // Use Firestore document ID
        ...doc.data(), // Include all other product data
      });
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

router.use("/orders", orderRouter);
router.get("/get-orders", async (req, res) => {
  try {
    const productsRef = collection(db, "client-details");
    const querySnapshot = await getDocs(productsRef);
    const products = [];

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id, // Use Firestore document ID
        ...doc.data(), // Include all other product data
      });
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed.");
    }
    res.redirect("/admin");
  });
});

export default router;
