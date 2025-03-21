import express from "express";
import { db } from "../firebase/firebaseApp.js"; // Import db
import bodyParser from "body-parser";

const adminRouter = express.Router();
adminRouter.use(bodyParser.urlencoded({ extended: false }));

adminRouter.get("/", (req, res) => {
  res.render("login");
});

adminRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersRef = collection(db, "users");
    const userDoc = doc(usersRef, username);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const adminData = docSnap.data();
      if (adminData.password === password) {
        req.session.isAdmin = true;
        res.redirect("/admin/dashboard");
      } else {
        console.error("Incorrect password for user:", username);
        res.status(401).send("Incorrect password");
      }
    } else {
      console.error("User not found:", username);
      res.status(401).send("User not found");
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Error authenticating user");
  }
});

adminRouter.get("/dashboard", (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.render("admin-dashboard");
  } else {
    res.redirect("/admin");
  }
});

export default adminRouter;
