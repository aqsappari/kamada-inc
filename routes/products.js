const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const products = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Phone" },
    { id: 3, name: "Tablet" },
  ];
  res.render("products", { products: products }); //You will need to create products.ejs
});

module.exports = router;
