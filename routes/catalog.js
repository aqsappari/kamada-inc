import express from "express";
import bodyParser from "body-parser";

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
} from "firebase/firestore";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("products");
});

router.get("/get-products", async (req, res) => {
  try {
    const productsCollection = collection(db, "products");
    const productSnapshot = await getDocs(productsCollection);
    const products = productSnapshot.docs.map((doc) => {
      const data = doc.data();
      let price = 0.0; // Default price

      if (typeof data.price === "string") {
        const parsedPrice = parseFloat(data.price);
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      } else if (typeof data.price === "number") {
        price = data.price;
      }

      return {
        id: doc.id,
        ...data,
        price: price.toFixed(2), // Format the price to two decimal places
      };
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/get-product/:id", async (req, res) => {
  try {
    const productRef = doc(db, "products", req.params.id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = {
        id: productSnap.id,
        ...productSnap.data(),
        price: parseFloat(productSnap.data().price), // Convert to number
      };

      // Handle NaN and format price
      if (isNaN(productData.price)) {
        productData.price = "0.00";
      } else {
        productData.price = productData.price.toFixed(2);
      }

      res.json(productData);
    } else {
      res.status(404).json({ error: "product not found" });
    }
  } catch (error) {
    console.error("Error fetching product from firestore:", error);
    res.status(500).json({ error: "failed to fetch product" });
  }
});

// Get product images by product ID
router.get("/get-product-images/:id", async (req, res) => {
  try {
    const productRef = doc(db, "products", req.params.id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists() && productSnap.data().images) {
      const images = productSnap.data().images.map((img) => img.cloudinaryURL);
      res.json(images);
    } else {
      res.status(404).json({ error: "product or images not found" });
    }
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ error: "failed to fetch images" });
  }
});

router.get("/:productId", (req, res) => {
  const id = req.params.productId;
  res.render("design-details", { id: id });
});

export default router;
