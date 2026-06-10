const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const connectDB = require("./config/db");

// Force IPv4 DNS resolution first (fixes connection issues on Windows with Node v18+)
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});