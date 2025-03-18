const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/get-started", (req, res) => {
  res.render("auth");
});

router.post("/create", (req, res) => {
  const data = req.body;
  res.send(data);
});

module.exports = router;
