const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/get-started", (req, res) => {
  // const name = "User";
  // const items = ["apple", "banana", "cherry"];
  res.render("auth");
});

module.exports = router;
