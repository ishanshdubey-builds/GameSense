const {Pool} = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.PORT) || 5432,
    database: process.env.DB_NAME || "gamesense",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
});

pool.on("error", (error) => {
    console.log("Unexpected PostgresSQL pool error:", error.message);
});

module.exports = pool;