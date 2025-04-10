import express from "express";
import bodyParser from "body-parser";
import { catalogRouter } from "./catalog.js";
import trackRouter from "./track.js";
import checkoutRouter from "./checkout.js";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("index");
});

router.use("/products", catalogRouter);
router.use("/checkout", checkoutRouter);
router.use("/track-order", trackRouter);

export default router;
