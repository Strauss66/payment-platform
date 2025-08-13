import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './config/db.js'; // init & auth the DB
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

export default app;