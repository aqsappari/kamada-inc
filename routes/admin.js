import express from "express";
import { db } from "../firebase/firebaseApp.js"; // Import db
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Import Firestore functions
import bodyParser from "body-parser";
import session from "express-session"; // Import express-session
import { dashboardContent } from "./admin/admin-helper.js";
import { productsContent } from "./admin/admin-helper.js";

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

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect("/admin/dashboard"); // Redirect to dashboard if logged in
  }
  next(); // Proceed to the next middleware or route handler
};

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

adminRouter.get("/", isLoggedIn, (req, res) => {
  // Apply isLoggedIn middleware
  // Render the admin login page. Pass the error message to the template.
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage; // Clear the error message after displaying it *once*
  res.render("login", { errorMessage }); // Pass errorMessage to the template
});

adminRouter.get("/dashboard", (req, res) => {
  if (req.session && req.session.isAdmin) {
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
  } else {
    console.log("Dashboard access denied - redirecting to login");
    return res.redirect("/admin");
  }
});

adminRouter.get("/products", async (req, res) => {
  if (req.session && req.session.isAdmin) {
    console.log("Products access granted");
    try {
      const querySnapshot = await getDocs(collection(db, "garments"));
      const products = {};

      querySnapshot.forEach((doc) => {
        const garmentName = doc.id;
        const garmentData = doc.data();

        products[garmentName] = {};

        if (garmentData.fabrics) {
          for (const fabricName in garmentData.fabrics) {
            const fabricData = garmentData.fabrics[fabricName];
            products[garmentName][fabricName] = {
              price: fabricData.price,
              sizes: fabricData.sizes || {},
              colors: fabricData.colors || [],
            };
          }
        }
      });

      const script = `
      <script>
        sessionStorage.setItem("garments", ${JSON.stringify(products)})
      </script>
      <script src="/js/admin-products.js"></script>
      `;

      res.render("admin-template", {
        body: productsContent, // Include products.ejs
        script: script,
        currentPage: "/admin/products",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    console.log("Products access denied - redirecting to login");
    return res.redirect("/admin");
  }
});

// adminRouter.get("/products", (req, res) => {
//   res.render("admin-products", { currentPage: "/admin/products" });
// });

adminRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed.");
    }
    res.redirect("/admin"); // Redirect back to the login page
  });
});

// Uploading products to firestore
adminRouter.post("/garments", async (req, res) => {
  // Removed :garment from URL
  try {
    const garmentName = req.body.name; // Get name from request body
    console.log(garmentName);

    if (!garmentName) {
      return res.status(400).json({ error: "Garment name is required." });
    }

    // Check if the garment already exists
    const garmentDoc = doc(db, "garments", garmentName);
    // const garmentDoc = await db.collection("garments").doc(garmentName).get();
    if (garmentDoc.exists) {
      return res.status(400).json({ error: "Garment already exists." });
    }

    // Add the garment name as a document
    await setDoc(garmentDoc, {});

    res.status(201).json({ message: "Garment added successfully." });
  } catch (error) {
    console.error("Error adding garment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

adminRouter.post("/fabrics", async (req, res) => {
  try {
    const fabrics = req.body.fabrics;

    for (const fabric of fabrics) {
      const { name, price, garment } = fabric;

      console.log(name, " ", price, " ", garment);

      if (!name || !price || !garment) {
        //Added garment validation
        return res
          .status(400)
          .json({ error: "Fabric name, price, and garment are required." });
      }

      const garmentDoc = doc(db, "garments", garment);

      await setDoc(garmentDoc, {});

      await updateDoc(garmentDoc, {
        [`fabrics.${name}`]: {
          // Dynamic field name
          price: price,
          sizes: {}, // Placeholder for sizes
          colors: [], // Placeholder for colors
        },
      });
    }

    res.status(201).json({ message: "Fabrics added successfully." });
  } catch (error) {
    console.error("Error adding fabrics:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

adminRouter.post("/sizes", async (req, res) => {
  try {
    const { garment, fabric, initials, measurements } = req.body;

    if (
      !garment ||
      !fabric ||
      !initials ||
      !measurements ||
      typeof measurements !== "object" ||
      Object.keys(measurements).length === 0
    ) {
      return res.status(400).json({
        error: "Garment, fabric, initials, and measurements are required.",
      });
    }

    const garmentDoc = doc(db, "garments", garment);

    const fabricPath = `fabrics.${fabric}.sizes.${initials}`;

    await updateDoc(garmentDoc, { [fabricPath]: measurements });

    res.status(201).json({ message: "Size added successfully." });
  } catch (error) {
    console.error("Error adding size:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default adminRouter;
