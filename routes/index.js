import express from "express";
import bodyParser from "body-parser";
import catalogRouter from "./catalog.js";
import trackRouter from "./track.js";
import { db } from "../firebase/firebaseApp.js"; // Import db
import { doc, setDoc, getDoc } from "firebase/firestore";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/design-details", (req, res) => {
  res.render("design-details");
});

router.get("/checkout", (req, res) => {
  res.render("checkout");
});

router.use("/products", catalogRouter);

router.use("/track-order", trackRouter);

router.get("/track-order", (req, res) => {
  const trackingId = req.query.id;

  if (trackingId) {
    // trackingId parameter exists, process it
    console.log("Tracking ID:", trackingId);

    const clientDocRef = doc(db, "client-details", trackingId);
    getDoc(clientDocRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        res.render("track-order", { id: trackingId }); // For now, just send the ID back
      } else {
        res.status(404).json({ message: "Tracking ID not found." });
      }
    });
  } else {
    // trackingId parameter is missing
    res.status(400).send("Tracking ID is required. <a href='/'>Go Home</a>");
  }
});

export default router;
