// index.js
import express from "express";
import indexRouter from "./routes/index.js";
import adminRouter from "./routes/admin.js";
import logger from "./middleware/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import multer from "multer";
import { cloudinary } from "./cloudinary/cloudinaryConfig.js";
import fs from "fs";
import { db } from "./firebase/firebaseApp.js"; // Import db
import { doc, setDoc } from "firebase/firestore";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);

function generateSignature(publicId, callback) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      public_id: publicId,
      timestamp: timestamp,
    },
    "yETPJGnQFiyMvkusIkRahIixSX4"
  );
  callback(signature, timestamp);
}

// Example route for generating signature
app.get("/signature", (req, res) => {
  generateSignature("kamada", (signature, timestamp) => {
    res.json({ signature: signature, timestamp: timestamp });
  });
});

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body.guestId);
    let guestId = req.body.guestId; // Access or create guestId

    const guestUploadDir = path.join(__dirname, "public", "uploads", guestId);

    if (!fs.existsSync(guestUploadDir)) {
      fs.mkdirSync(guestUploadDir, { recursive: true });
    }

    cb(null, guestUploadDir); // Store files in public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate unique filename
  },
});

const upload = multer({ storage: storage });

// Upload route
app.post("/upload", upload.array("files"), async (req, res) => {
  console.log("Received files:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const guestId = req.body.guestId;
  const guestUploadDir = path.join(__dirname, "public", "uploads", guestId);

  try {
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          public_id: `${guestId}_${file.filename}`,
          use_filename: false,
          unique_filename: false,
        });
        return {
          filename: file.filename,
          cloudinaryUrl: result.secure_url, // Include Cloudinary URL
          publicId: result.public_id, // Include Cloudinary public ID
        };
      })
    );

    // Delete local folder
    fs.rm(guestUploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error("Error deleting local folder:", err);
      } else {
        console.log("Local folder deleted:", guestUploadDir);
      }
    });

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Cloudinary upload failed" });
  }
});

// Firestore save route
app.post("/save-to-firestore", async (req, res) => {
  try {
    const necessaryData = req.body;
    console.log(necessaryData);
    const guestId = necessaryData.guestId;

    // Add data to Firestore
    const clientDocRef = doc(db, "client-details", guestId);
    await setDoc(clientDocRef, necessaryData);

    res.json({ message: "Data saved to Firestore successfully!" });
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    res.status(500).json({ error: "Failed to save data to Firestore" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
