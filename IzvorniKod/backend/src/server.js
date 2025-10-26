import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

// --- Import tvojih ruta i konfiguracija ---
import { pool } from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Swagger paketi
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Sesije za Passport (potrebno za Google OAuth)
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
const swaggerOptions = {
  swaggerDefinition: {
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
  apis: ["./src/routes/*.js"], // tvoj pattern
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// --- KRAJ SWAGGER KONFIGURACIJE ---

// --- TVOJE RUTE ---
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
// npr. kasnije: app.use("/api/recipes", recipeRoutes);

// --- POKRETANJE SERVERA ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server pokrenut na portu ${PORT}`);
  console.log(`📘 Swagger dokumentacija: http://localhost:${PORT}/api-docs`);
});
