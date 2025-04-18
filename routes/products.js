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
import { productsContent } from "./admin/admin-helper.js";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { Readable } from "stream";
import { cloudinary } from "../cloudinary/cloudinaryConfig.js";
import multer from "multer";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  console.log("Products access granted");
  try {
    const script = `<script src="/js/admin-products.js"></script>`;

    res.render("admin-template", {
      body: productsContent,
      script: script,
      currentPage: "/admin/products",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/add-product", (req, res) => {
  res.render("add-product", { title: "Add Product", hide: "true" });
});

// Function to generate unique product ID
async function generateNextProductId() {
  const productsRef = collection(db, "products");
  const q = query(productsRef, orderBy("productId", "desc"), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const lastDoc = querySnapshot.docs[0].data();
    const lastProductId = lastDoc.productId;
    const lastNumber = parseInt(lastProductId.substring(2));
    const nextNumber = lastNumber + 1;
    return `PR${nextNumber.toString().padStart(6, "0")}`;
  } else {
    return "PR000001";
  }
}

const FILESIZE_MB = 10;
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Cloudinary
  limits: { fileSize: FILESIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError =
        "Only JPEG, JPG, PNG, GIF, and WEBP image files are allowed!";
      cb(null, false);
    }
  },
}).array("files", 10);

let uploadPromises = [];
let uploadInProgress = false; // Flag to track upload status

router.post("/upload", upload, async (req, res) => {
  uploadInProgress = true; // Set flag to true

  try {
    const filesRemoved = JSON.parse(req.body.filesRemoved || "[]");
    if (filesRemoved.length > 0) {
      const publicIds = filesRemoved.map((file) => file.publicId);
      await cloudinary.api.delete_resources(publicIds);
    }

    const filesToUpload = req.files || [];
    const uploadedFiles = [];

    if (filesToUpload.length > 0) {
      const productId = req.body.productId;

      uploadPromises = filesToUpload.map(async (file) => {
        const publicId = productId ? `${productId}/${uuidv4()}` : uuidv4();

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", public_id: publicId },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  ...result,
                  publicId,
                  originalFilename: file.originalname,
                });
              }
            }
          );

          // Use Readable.from to create a stream from the file buffer
          Readable.from(file.buffer).pipe(uploadStream);
        });
      });

      const results = await Promise.all(uploadPromises);

      uploadedFiles.push(
        ...results.map((result) => ({
          filename: result.originalFilename,
          cloudinaryUrl: result.secure_url,
          publicId: result.publicId,
        }))
      );
    }

    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File size exceeds 10MB." });
    } else {
      return res.status(500).json({ error: "Cloudinary upload failed." });
    }
  } finally {
    uploadInProgress = false; // Reset flag
  }
});
// New route to handle cancellation
router.post("/cancel-upload", async (req, res) => {
  try {
    if (uploadInProgress) {
      // Delete the uploaded images from Cloudinary
      const publicIds = uploadPromises.map(
        (promise) => promise.value?.publicId
      );

      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
      uploadPromises = []; //clear promises.
    }
    res.json({ success: true, message: "Upload cancelled." });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    uploadInProgress = false;
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

// Example Cloudinary delete route
router.delete("/delete-cloudinary/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      prefix: productId + "/", // Cloudinary Prefix
    });

    const publicIds = resources.map((resource) => resource.public_id);

    if (publicIds.length > 0) {
      const deletionResult = await cloudinary.api.delete_resources(publicIds);
      console.log("Cloudinary deletion result:", deletionResult);
    }

    res.json({
      success: true,
      message: "Cloudinary files deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting Cloudinary files:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Example Firestore delete route
router.delete("/delete-firestore/:productId", async (req, res) => {
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

router.get("/:productId", async (req, res) => {
  const productID = req.params.productId;
  res.render("add-product", { title: productID, hide: "false" }); // Pass data to add-product.ejs
});

router.get("/:productId/retrieve", async (req, res) => {
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

export default router;
