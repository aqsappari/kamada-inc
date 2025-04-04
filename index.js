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
import nodemailer from "nodemailer";
import { Readable } from "stream";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

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

// Nodemailer configuration (replace with your Gmail credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sappari.aq@gmail.com",
    pass: "crvj bpnh wviq garr",
  },
});

function generateTrackingId() {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/g, "")
    .substring(0, 14); // Format: YYYYMMDDHHMMSS
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // Shorter random part
  return `TRACK-${timestamp}-${random}`;
}

// Firestore save route
app.post("/save-to-firestore", async (req, res) => {
  try {
    const necessaryData = req.body;
    const trackingId = generateTrackingId();

    // Add trackingId to necessaryData
    necessaryData.trackingId = trackingId;

    // Add data to Firestore with trackingId as document name
    const clientDocRef = doc(db, "client-details", trackingId);
    await setDoc(clientDocRef, necessaryData);

    // Send email
    const mailOptions = {
      from: {
        name: "KAMADA ZC",
        address: "sappari.aq@gmail.com",
      },
      replyTo: "sappari.aq@example.com",
      to: necessaryData.client.email,
      subject: "Your Order Tracking ID",
      html: `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Your Order Tracking ID</title>
          </head>
          <body>
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h1 style="font-weight: bold; text-style: italic">KAMADA</h1>
                  <h2>Your Order Tracking ID</h2>
                  <p>Dear ${necessaryData.client.fullName},</p>
                  <p>Thank you for your order! Your tracking ID is:</p>
                  <h3 style="background-color: #f0f0f0; padding: 10px;">${trackingId}</h3>
                  <p>You can use this ID to track your order on our website.</p>
                  <p>If you have any questions, please contact us.</p>
                  <p>Sincerely,<br>KAMADA ZC</p>
              </div>
          </body>
          </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Data saved to Firestore and email sent successfully!",
      trackingId: trackingId,
    });
  } catch (error) {
    console.error("Error saving to Firestore or sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to save data to Firestore or send email" });
  }
});

const upload = multer().array("files", 10);
app.post("/upload", upload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const stream = Readable.from(file.buffer);

        const result = await new Promise((resolve, reject) => {
          const cloudinaryStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" }, // Detect file type automatically
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.pipe(cloudinaryStream);
        });

        return {
          filename: file.originalname,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
        };
      })
    );

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Cloudinary upload failed." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
