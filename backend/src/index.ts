import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { winstonLogger } from './utils/logger';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body Parsing & Logging
app.use(express.json());
app.use(morgan('combined'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gitbio')
  .then(() => winstonLogger.info('Connected to MongoDB'))
  .catch(err => winstonLogger.error('MongoDB connection error:', err));

// Routes placeholders
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github.routes';
import stripeRoutes from './routes/stripe.routes';
import templateRoutes from './routes/template.routes';

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'GitBio API is running' });
});

// Webhook raw body requires a specific path without general json parsing
// app.use('/api/stripe/webhook', express.raw({type: 'application/json'}));

// Import and use actual routes (To be implemented)
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/stripe', stripeRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  winstonLogger.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  winstonLogger.info(`Server running on port ${PORT}`);
});
