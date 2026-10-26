
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const pool = require("./db/pool");
const valorantRoutes = require("./modules/players/players.routes");

const app = express();

// Allow requests from the deployed GameSense frontend
app.use(
  cors({
    origin: [
      "https://game-sense-silk.vercel.app",
    ],
    methods: ["GET", "HEAD", "OPTIONS"],
  })
);

app.use(express.json());

// VALORANT API
app.use("/api/valorant", valorantRoutes);

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      success: true,
      message: "API and database connected",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// API welcome route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to GameSense API",
  });
});

// Serve the production React frontend if available
const frontendDist = path.resolve(__dirname, "../frontend/dist");

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(
        path.join(frontendDist, "index.html")
      );
    }

    next();
  });
}

module.exports = app;





// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const pool = require("./db/pool");
// const valorantRoutes = require("./modules/players/players.routes");

// const app = express();

// app.use(express.json());

// // VALORANT API
// app.use("/api/valorant", valorantRoutes);

// // Database health check
// app.get("/api/health", async (req, res) => {
//     try {
//         const result = await pool.query(
//             "SELECT current_database() AS database"
//         );

//         res.json({
//             success: true,
//             message: "API and database connected",
//             database: result.rows[0].database,
//         });
//     } catch (error) {
//         console.error("Health check failed:", error.message);

//         res.status(500).json({
//             success: false,
//             message: "Database connection failed",
//         });
//     }
// });

// // API welcome route
// app.get("/api", (req, res) => {
//     res.json({
//         success: true,
//         message: "Welcome to GameSense API",
//     });
// });

// // Serve the production React frontend
// const frontendDist = path.resolve(__dirname, "../frontend/dist");

// if (fs.existsSync(frontendDist)) {
//     app.use(express.static(frontendDist));

//     app.use((req, res, next) => {
//         if (req.method === "GET" && !req.path.startsWith("/api")) {
//             return res.sendFile(
//                 path.join(frontendDist, "index.html")
//             );
//         }

//         next();
//     });
// }

// module.exports = app;


