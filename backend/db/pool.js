const {Pool} = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "gamesense",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,

    ssl: process.env.NODE_ENV === "production"
  ? { rejectUnauthorized: false }
  : false,
});

pool.on("error", (error) => {
    console.log("Unexpected PostgresSQL pool error:", error.message);
});

module.exports = pool;