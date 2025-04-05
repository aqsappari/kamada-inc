import express from "express";
import bodyParser from "body-parser";
import { db } from "../firebase/firebaseApp.js"; // Import db
import { doc, setDoc, getDoc } from "firebase/firestore";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res) => {
  const trackingId = req.query.id;

  if (trackingId) {
    // trackingId parameter exists, process it

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
      const orderData = docSnapshot.data();
      res.json(orderData); // Send the entire orderData object
    } else {
      res.status(404).json({ error: "Order not found." });
    }
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ error: "Failed to fetch order data." });
  }
});

export default router;
