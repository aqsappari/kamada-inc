// index.js
import indexRouter from "./routes/index.js";
import adminRouter from "./routes/admin.js";
import logger from "./middleware/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use(logger);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser

app.use("/", indexRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
