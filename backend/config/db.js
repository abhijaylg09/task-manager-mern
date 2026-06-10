const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("Database connection failed: MONGO_URI is not defined in .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Initial database connection failed:", error.message);

    // If it's a DNS resolution issue, try self-healing by overriding DNS servers
    if (error.code === "ECONNREFUSED" || error.message.includes("querySrv") || error.message.includes("ENOTFOUND")) {
      console.log("Attempting self-healing DNS resolution fallback...");
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected Successfully (via DNS resolver fallback)");
        return;
      } catch (retryError) {
        console.error("Database reconnection failed after DNS override:", retryError.message);
      }
    }

    console.log("\n======================================================================");
    console.log("CRITICAL: MongoDB connection could not be established.");
    console.log("If you see 'bad auth : authentication failed', please check that the credentials");
    console.log("in backend/.env are valid and have not expired.");
    console.log("======================================================================\n");
    
    // We do not exit the process here so that the server can still run and serve 
    // static files or provide descriptive error responses, but we warn the user.
  }
};

module.exports = connectDB;