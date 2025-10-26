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
  // DODAJ OVAJ OBJEKT ZA SSL:
  ssl: {
    rejectUnauthorized: false
  }
});

// Testna IIFE funkcija za provjeru konekcije pri pokretanju
(async () => {
  try {
    console.log(" Pokušavam se spojiti na PostgreSQL...");
    const client = await pool.connect();
    console.log(" Povezano s PostgreSQL bazom!");
    client.release();
  } catch (err) {
    console.error(" Greška pri spajanju:", err.stack);
  }
})();