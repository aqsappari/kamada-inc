const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const name = "User";
  const items = ["apple", "banana", "cherry"];
  res.render("index", { name: name, items: items });
});

module.exports = router;
