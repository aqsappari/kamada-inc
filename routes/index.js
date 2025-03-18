const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/get-started", (req, res) => {
  res.render("auth");
});

router.post("/create", async (req, res) => {
  const data = req.body;
  await User.add(data);
  res.send({ msg: "User added" });
});

module.exports = router;
