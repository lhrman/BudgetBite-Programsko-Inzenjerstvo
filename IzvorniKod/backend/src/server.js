import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js'; // Tvoj db config
import testRoutes from './routes/testRoutes.js'; // Tvoje testne rute

// Učitaj nove pakete za Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- SWAGGER KONFIGURACIJA ---

// 1. Definicija Swagger opcija
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // Verzija OpenAPI specifikacije
    info: {
      title: 'BudgetBite API',
      version: '1.0.0',
      description: 'API za BudgetBite studentsku aplikaciju',
    },
    servers: [
      {
        // Povući ćemo port iz .env da bude dinamično
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  // Putanja do SVIH tvojih datoteka s rutama.
  // Kasnije ćeš dodati 'authRoutes.js', 'recipeRoutes.js' itd.
  apis: ['./src/routes/*.js'],
};

// 2. Generiraj specifikaciju
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// 3. Postavi Swagger UI rutu
// Ova linija mora biti PRIJE ostalih app.use('/api', ...) ruta
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- KRAJ SWAGGER KONFIGURACIJE ---

// Ovdje dolaze tvoje API rute
app.use('/api', testRoutes);
// npr. app.use('/api/auth', authRoutes);
// npr. app.use('/api/recipes', recipeRoutes);


// Pokretanje servera
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server pokrenut na portu ${PORT}`);
});
