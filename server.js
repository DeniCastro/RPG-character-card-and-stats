const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Paste your connection string here (replace <username> and <password>)
const MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rpg_db?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas successfully!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Status Endpoint
app.get("/api/status", (req, res) => {
  res.json({ message: "RPG Backend Server is online and operational!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});