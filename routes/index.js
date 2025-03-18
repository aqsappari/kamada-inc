const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/get-started", (req, res) => {
  res.render("auth");
});

router.post("/get-started", (req, res) => {});

module.exports = router;
