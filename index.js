const express = require("express");
const app = express();
const port = 3000;
const path = require("path"); // Import the path module

// Import route files
const indexRouter = require("./routes/index");

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory using path.join()
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

// Use route files
app.use("/", indexRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
