import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import gdprRoutes from "./routes/gdprRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { pool } from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import lookupRoutes from "./routes/lookupRoutes.js";
import "./config/googleConfig.js";
import moodRoutes from "./routes/moodRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import reflectionRoutes from "./routes/reflectionRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";

import { startReminderJob } from "./jobs/reminderJob.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

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

// Swagger setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        url: `http://localhost:${process.env.PORT || 3004}`,
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
  apis: ["./src/routes/*.js"],

};



const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log("Swagger dokumentacija: http://localhost:3004/api-docs");



// Rute
app.use("/api/notifications", notificationRoutes);
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api", lookupRoutes);
app.use("/api/gdpr", gdprRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/reflection", reflectionRoutes);


startReminderJob();

// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});
