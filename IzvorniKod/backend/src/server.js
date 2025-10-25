import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Testna ruta
app.use('/api', testRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server pokrenut na portu ${PORT}`);
});
