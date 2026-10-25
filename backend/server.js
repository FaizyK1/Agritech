import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import soilRoutes from './routes/soilRoutes.js';
import pestRoutes from './routes/pestRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / Welcome Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AgriTech Smart Farming Management API',
    version: '1.0.0',
    documentation: 'See README.md for endpoint specifications',
    endpoints: [
      '/api/auth',
      '/api/farms',
      '/api/crops',
      '/api/soil',
      '/api/pests',
      '/api/market',
      '/api/consultations',
      '/api/weather',
      '/api/admin'
    ]
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[AgriTech Server]: Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
