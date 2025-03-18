const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];
  res.render("users", { users: users }); // You'll need to create users.ejs
});

router.get("/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

module.exports = router;
