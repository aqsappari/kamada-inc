import express from "express";
import { db } from "../firebase/firebaseApp.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import { cloudinary } from "../cloudinary/cloudinaryConfig.js";
import { Readable } from "stream";
import { tempFileStorage } from "./catalog.js";
import path from "path";

const router = express.Router();

// Remove if bodyParser is used at the app level
// router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res) => {
  res.render("checkout");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sappari.aq@gmail.com",
    pass: "crvj bpnh wviq garr",
  },
});

const generateTrackingId = () => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/g, "")
    .substring(0, 14);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRACK-${timestamp}-${random}`;
};

const uploadToCloudinary = async (file) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });

    return {
      filename: file.originalname,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      size: file.size,
      extension: path.extname(file.originalname).substring(1),
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Cloudinary upload failed.");
  }
};

router.post("/save-to-firestore", async (req, res) => {
  try {
    const necessaryData = req.body;
    const trackingId = generateTrackingId();

    necessaryData.trackingId = trackingId;
    necessaryData.status = "Order Received";

    const productID = necessaryData.productArray.id;
    console.log(productID);

    const productDocRef = doc(db, "products", productID);
    const productDocSnapshot = await getDoc(productDocRef);

    const currentOrder = productDocSnapshot.data()?.order || 0;
    const newOrder = currentOrder + necessaryData.productArray.productOrder;

    await setDoc(productDocRef, { order: newOrder }, { merge: true });

    const clientDocRef = doc(db, "client-details", trackingId);
    await setDoc(clientDocRef, necessaryData);

    const mailOptions = {
      from: { name: "KAMADA ZC", address: "sappari.aq@gmail.com" },
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

    return res.json({
      message: "Data saved to Firestore and email sent successfully!",
      trackingId: trackingId,
    });
  } catch (error) {
    console.error("Error saving to Firestore or sending email:", error);
    return res.status(500).json({
      error: "Failed to save data to Firestore or send email",
    });
  }
});

router.post("/upload-cloudinary", async (req, res) => {
  try {
    const fileIds = req.body.fileIds;
    const uploadedFiles = [];

    for (const fileId of fileIds) {
      const file = tempFileStorage.get(fileId);
      if (file) {
        const cloudinaryData = await uploadToCloudinary(file);
        uploadedFiles.push(cloudinaryData);
        tempFileStorage.delete(fileId);
      }
    }

    return res.json({ files: uploadedFiles });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Cloudinary upload failed." });
  }
});

router.post("/fileuploaded", async (req, res) => {
  try {
    const fileIds = req.body.fileIds;
    const uploadedFiles = [];

    for (const fileId of fileIds) {
      const file = tempFileStorage.get(fileId);
      if (file) {
        uploadedFiles.push({
          originalName: file.originalname,
          originalSize: file.size,
          originalExtension: file.originalname.split(".").pop(),
        });
      }
    }

    console.log(tempFileStorage);

    res.json(uploadedFiles);
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    res.status(500).json({ error: "Failed to fetch uploaded files." });
  }
});

export default router;
