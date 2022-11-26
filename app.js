require("dotenv").config();
const hostname = "0.0.0.0";
const express = require("express");
const mongoose = require("mongoose");
var PORT = process.env.PORT || 3500;
const MONGODB_URI = process.env.MONGODB; //replace with your ATLAS database link
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("tiny"));

const apiRoutes_notes = require("./routes/note_routes");
const apiRoutes_auth = require("./routes/auth_routes.js");
const apiRoutes_category = require("./routes/category_routes");

app.use("/API", apiRoutes_notes);
app.use("/API", apiRoutes_category);
app.use("/API", apiRoutes_auth);

app.use((req, res) => {
  res.status(404).json({ Error: "PAGE NOT FOUND" });
});
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose.connect(MONGODB_URI).catch((err) => {
  console.log(err);
});

app.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
