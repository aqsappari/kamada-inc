import express from "express";
import bodyParser from "body-parser";
import catalogRouter from "./catalog.js";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/design-details", (req, res) => {
  res.render("design-details");
});

router.get("/checkout", (req, res) => {
  res.render("checkout");
});

router.use("/products", catalogRouter);

export default router;
