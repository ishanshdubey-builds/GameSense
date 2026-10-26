
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env"),
});

const app = require("./app");
const pool = require("./db/pool");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`GameSense API running at http://localhost:${PORT}`);
});

function shutdown() {
    console.log("\nShutting down GameSense API...");

    server.close(async () => {
        try {
            await pool.end();
            console.log("Database connections closed.");
            process.exit(0);
        } catch (error) {
            console.error("Error closing database:", error.message);
            process.exit(1);
        }
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
