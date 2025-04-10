import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
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

const catalogRouter = express.Router();
catalogRouter.use(bodyParser.urlencoded({ extended: false }));

catalogRouter.get("/", async (req, res) => {
  res.render("products");
});

catalogRouter.get("/get-products", async (req, res) => {
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

catalogRouter.get("/get-product/:id", async (req, res) => {
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
catalogRouter.get("/get-product-images/:id", async (req, res) => {
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

const FILESIZE_MB = 100;
const tempFileStorage = new Map(); // Store files temporarily

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "image/tif",
  "application/pdf",
  "application/postscript",
  "application/vnd.adobe.illustrator",
  "application/illustrator",
  "application/x-illustrator",
  "application/x-eps",
  "application/coreldraw",
  "application/cdr",
  "application/x-photoshop",
  "image/vnd.adobe.photoshop",
  "application/photoshop",
  "application/x-indesign",
  "application/x-xd",
  "application/sketch",
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const validateFileType = (file) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return true;
  }
  return false;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILESIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (validateFileType(file)) {
      cb(null, true);
    } else {
      req.fileValidationError = `Invalid file type. Allowed types are: ${ALLOWED_MIME_TYPES.join(
        ", "
      )}.`;
      cb(null, false);
    }
  },
}).array("files", 10);

catalogRouter.post("/upload", upload, async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const fileIds = req.files.map((file) => {
      const fileId = uuidv4();
      tempFileStorage.set(fileId, file); // Store file data here
      return fileId;
    });

    // console.log(tempFileStorage);

    res.json({ fileIds });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files." });
  }
});

catalogRouter.get("/:productId", (req, res) => {
  const id = req.params.productId;
  res.render("design-details", { id: id });
});

export { catalogRouter, tempFileStorage };
