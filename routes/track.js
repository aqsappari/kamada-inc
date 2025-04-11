import express from "express";
import { db } from "../firebase/firebaseApp.js";
import { doc, getDoc } from "firebase/firestore";

const router = express.Router();

// Route to render the track order page
router.get("/", async (req, res) => {
  const trackingId = req.query.id;

  if (trackingId) {
    try {
      const clientDocRef = doc(db, "client-details", trackingId);
      const docSnapshot = await getDoc(clientDocRef);

      if (docSnapshot.exists()) {
        res.render("track-order", { id: trackingId });
      } else {
        res.status(404).json({ message: "Tracking ID not found." });
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(400).send("Tracking ID is required. <a href='/'>Go Home</a>");
  }
});

// Route to get order data by tracking ID (JSON response)
router.get("/data", async (req, res) => {
  const trackingId = req.query.id;
  console.log("Tracking ID:", trackingId);

  if (!trackingId) {
    return res.status(400).json({ error: "Tracking ID is required." });
  }

  try {
    const clientDocRef = doc(db, "client-details", trackingId);
    const docSnapshot = await getDoc(clientDocRef);

    if (docSnapshot.exists()) {
      res.json(docSnapshot.data());
    } else {
      res.status(404).json({ error: "Order not found." });
    }
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ error: "Failed to fetch order data." });
  }
});

export default router;
