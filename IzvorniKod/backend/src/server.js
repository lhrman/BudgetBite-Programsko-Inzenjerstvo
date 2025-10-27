
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- SWAGGER KONFIGURACIJA ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//koristi jednostavnu, pouzdanu putanju
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
        url: `http://localhost:${process.env.PORT || 3001}/api`,
      },
    ],
  },
  //relativna putanja 
  apis: ["./src/routes/*.js"],
};

// Generiraj Swagger specifikaciju
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Posluži Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

console.log("Swagger dokumentacija: http://localhost:3001/api-docs");
// --- KRAJ SWAGGERA ---

// --- RUTE ---
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

// --- POKRETANJE SERVERA ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});
