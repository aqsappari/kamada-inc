import express from "express";
import { db } from "../firebase/firebaseApp.js"; // Import db
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore"; // Import Firestore functions
import bodyParser from "body-parser";
import { ordersContent } from "./admin/admin-helper.js";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  console.log("Products access granted");
  try {
    const script = `<script src="/js/admin-orders.js"></script>`;

    res.render("admin-template", {
      body: ordersContent,
      script: script,
      currentPage: "/admin/orders",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/data", async (req, res) => {
  const trackingId = req.query.id;
  console.log(trackingId);

  if (!trackingId) {
    return res.status(400).json({ error: "Tracking ID is required." });
  }

  try {
    const orderDocRef = doc(db, "client-details", trackingId);
    const orderSnapshot = await getDoc(orderDocRef);

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found." });
    }

    const orderData = orderSnapshot.data();
    res.json(orderData);
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ error: "Failed to fetch order data." });
  }
});
// Firestore save route
router.post("/save-to-firestore", async (req, res) => {
  try {
    const necessaryData = req.body;
    let productId = necessaryData.productId; // Check if productId exists in the request

    if (!productId) {
      productId = await generateNextProductId(); // Generate new productId if it doesn't exist
    }

    const firestoreData = {
      ...necessaryData,
      productId: productId,
    };

    const productDocRef = doc(db, "products", productId);
    await setDoc(productDocRef, firestoreData);

    res.json({
      message: "Data saved to Firestore successfully!",
      productId: productId,
    });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    res.status(500).json({ error: "Failed to save data to Firestore" });
  }
});

// Example Firestore delete route
router.delete("/delete-firestore/:trackId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const productRef = doc(db, "products", productId);
    const prodID = await getDoc(productRef);

    if (!prodID.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in Firestore." });
    }

    await deleteDoc(productRef); // Use deleteDoc instead of productRef.delete()

    res.json({ success: true, message: "Product deleted from Firestore." });
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:trackId", async (req, res) => {
  const trackId = req.params.trackId;
  res.render("view-order", { title: trackId });
});

router.get("/:trackId/retrieve", async (req, res) => {
  try {
    const productId = req.params.productId;
    const productDocRef = doc(db, "products", productId);
    const productDocSnapshot = await getDoc(productDocRef);

    if (productDocSnapshot.exists()) {
      const productData = productDocSnapshot.data();
      res.json(productData); // Send product data as JSON
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Order Status
router.put("/:trackingId/status", async (req, res) => {
  const trackingId = req.params.trackingId;
  const newStatus = req.body.status;

  if (!trackingId || !newStatus) {
    return res
      .status(400)
      .json({ error: "Tracking ID and new status are required." });
  }

  try {
    const orderDocRef = doc(db, "client-details", trackingId);

    // Check if the document exists before attempting to update
    const orderDocSnapshot = await getDoc(orderDocRef);
    if (!orderDocSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found." });
    }

    await updateDoc(orderDocRef, {
      status: newStatus,
    });

    res.json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
