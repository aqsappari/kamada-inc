import express from "express";
import bodyParser from "body-parser";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  res.render("products");
});

export default router;
