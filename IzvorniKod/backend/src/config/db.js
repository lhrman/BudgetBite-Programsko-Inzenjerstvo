import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    console.log("🔄 Pokušavam se spojiti na PostgreSQL...");
    const client = await pool.connect();
    console.log("Povezano s PostgreSQL bazom!");
    client.release();
  } catch (err) {
    console.error("Greška pri spajanju:", err.stack);
  }
})();
