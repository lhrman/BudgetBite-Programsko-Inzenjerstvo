// ... (tvoj 'const express = require('express');' i ostali importi)

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ... (tvoj 'const app = express();')
// ... (tvoj 'app.use(express.json());')

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
        url: 'http://localhost:5000/api', // Tvoj lokalni server (podesi port ako treba)
      },
    ],
  },
  // Putanja do datoteka gdje pišeš JSDoc komentare (tvoje rute)
  apis: ['./src/routes/*.js'], 
};

// 2. Generiraj specifikaciju
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// 3. Postavi Swagger UI rutu
// Ovo će kreirati novu stranicu na http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ... (tvoje rute, npr. app.use('/api/auth', authRoutes);)
// ... (tvoj 'app.listen(...)')