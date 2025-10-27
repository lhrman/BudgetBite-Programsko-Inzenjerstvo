// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// --- Import tvojih ruta i konfiguracija ---
import { pool } from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// --- IMPORT KONFIGURACIJA (KLJUČNO!) ---
import "./config/googleConfig.js";

// Swagger paketi
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// --- Inicijalizacija ---
dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Sesije
app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// --- SWAGGER KONFIGURACIJA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.join(__dirname, "routes", "*.js");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BudgetBite API",
      version: "1.0.0",
      description: "API za BudgetBite studentsku aplikaciju",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`, // Ispravno, bez /api
        description: "Lokalni razvojni server",
      },
    ],
    // Definiramo tagove da server bude spreman
    tags: [
      {
        name: "Autentikacija",
        description: "Rute za registraciju, prijavu i korisnicke podatke",
      },
      {
        name: "Test",
        description: "Testna ruta za provjeru rada servera",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [routesPath], // Neka traži sve fileove
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- API RUTE ---
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

// --- SERVER START ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server pokrenut na portu ${PORT}`);
  console.log(`📘 Swagger dokumentacija: http://localhost:${PORT}/api-docs`);
});