import express from "express";
import { db } from "../firebase/firebaseApp.js";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { ordersContent } from "./admin/admin-helper.js";

const router = express.Router();

// Route to render the orders admin page
router.get("/", async (req, res) => {
  try {
    const script = `<script src="/js/admin-orders.js"></script>`;
    res.render("admin-template", {
      body: ordersContent,
      script: script,
      currentPage: "/admin/orders",
    });
  } catch (error) {
    console.error("Error rendering orders admin page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to get order data by tracking ID
router.get("/data", async (req, res) => {
  const trackingId = req.query.id;
  if (!trackingId) {
    return res.status(400).json({ error: "Tracking ID is required." });
  }

  try {
    const orderDocRef = doc(db, "client-details", trackingId);
    const orderSnapshot = await getDoc(orderDocRef);

    if (!orderSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(orderSnapshot.data());
  } catch (error) {
    console.error("Error fetching order data:", error);
    res.status(500).json({ error: "Failed to fetch order data." });
  }
});

// Route to save order data to Firestore (product related)
router.post("/save-to-firestore", async (req, res) => {
  try {
    const orderData = req.body; // Renamed for clarity
    const productId = orderData.productId || (await generateNextProductId()); // Generate if missing

    const firestoreData = { ...orderData, productId };
    const productDocRef = doc(db, "products", productId);
    await setDoc(productDocRef, firestoreData);

    res.json({ message: "Data saved to Firestore successfully!", productId });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    res.status(500).json({ error: "Failed to save data to Firestore" });
  }
});

// Route to delete a product from Firestore by product ID
router.delete("/delete-firestore/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const productRef = doc(db, "products", productId);
    const productDocSnapshot = await getDoc(productRef);

    if (!productDocSnapshot.exists()) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in Firestore." });
    }

    await deleteDoc(productRef);
    res.json({ success: true, message: "Product deleted from Firestore." });
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to render the view-order page
router.get("/:trackId", async (req, res) => {
  const trackId = req.params.trackId;
  res.render("view-order", { title: trackId });
});

// Route to retrieve product data by product ID
router.get("/:productId/retrieve", async (req, res) => {
  try {
    const productId = req.params.productId;
    const productDocRef = doc(db, "products", productId);
    const productDocSnapshot = await getDoc(productDocRef);

    if (productDocSnapshot.exists()) {
      res.json(productDocSnapshot.data());
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update order status by tracking ID
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
    const orderDocSnapshot = await getDoc(orderDocRef);

    if (!orderDocSnapshot.exists()) {
      return res.status(404).json({ error: "Order not found." });
    }

    await updateDoc(orderDocRef, { status: newStatus });
    res.json({ message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
