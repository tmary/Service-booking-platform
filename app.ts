import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/user';
import serviceRoutes from './routes/service';
import bookingRoutes from './routes/bookings';
import registrationRoutes from './routes/registration';
import providerRoutes from './routes/provider';
import notificationRoutes from './routes/notifications';

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/service-platform';

// Connect to MongoDB
mongoose.connect(dbUrl).then(() => {
    console.log('MongoDB connected successfully'); 
}).catch((err: Error) => {
    console.error('MongoDB connection error:', err);
    return;
});

// Configure CORS - before any routes
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Log minimal request info
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/registration-requests', registrationRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Backend is running!' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Length:', process.env.JWT_SECRET!.length);

export default app;
