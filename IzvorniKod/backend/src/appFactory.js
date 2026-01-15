import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Routes
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import lookupRoutes from "./routes/lookupRoutes.js";

// Side-effect: registrira Google strategy
import "./config/googleConfig.js";

// Swagger (može ostati – nije nužno za testove, ali ne smeta)
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

export function createApp() {
  const app = express();

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

  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "BudgetBite API",
        version: "1.0.0",
        description: "API za BudgetBite studentsku aplikaciju",
      },
      servers: [{ url: `http://localhost:${process.env.PORT || 3001}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.js"],
  };

  const swaggerSpecs = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

  // Rute (isto kao u tvom server.js)
  app.use("/api", testRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/student", studentRoutes);
  app.use("/api/recipes", recipeRoutes);
  app.use("/api", lookupRoutes);

  return app;
}
