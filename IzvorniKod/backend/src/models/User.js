// src/models/User.js
import { pool } from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    return result.rows[0];
  },

  // <-- NOVA FUNKCIJA
  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    return result.rows[0];
  },

  async create({ email, name }) {
    const result = await pool.query(
      "INSERT INTO users (email, name, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [email, name]
    );
    return result.rows[0];
  },

  // TODO: Ovdje dodajte funkciju za ažuriranje profila (za Tjedan 2 - upitnik)
  // npr. async updatePreferences(id, { budget, goals, equipment }) { ... }
};