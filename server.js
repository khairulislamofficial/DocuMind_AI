require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const extractRouter = require("./routes/extract");
const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow frontend local development access
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Server Warm-up Route (essential to handle Render free tier cold starts)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "DocuMind Server is awake and ready!" });
});

// API Routes
app.use("/api/extract", extractRouter);
app.use("/api/chat", chatRouter);

// Serve built React assets
const clientDistPath = path.join(__dirname, "client/dist");
app.use(express.static(clientDistPath));

// Fallback all non-API routing to built index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      // Friendly message if the frontend static assets are not built yet
      res
        .status(200)
        .send(
          "DocuMind AI Backend is active! Frontend is currently building or not yet compiled."
        );
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    error: err.message || "An internal server error occurred."
  });
});

app.listen(PORT, () => {
  console.log(`DocuMind AI server running on port ${PORT}`);
});
