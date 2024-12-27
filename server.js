require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { notFound } = require('./handlers/errorHandlers');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('dev'));

// Define allowed origins for CORS
const allowedOrigins = [
  'https://pioneerinstitute.in',
  'https://www.pioneerinstitute.in',
  'https://pil-admin.site',
  'https://www.pil-admin.site',
  'http://pioneerinstitute.in',
  'http://pil-admin.site',
  'http://localhost:3002',
  'http://localhost:3000',
  'http://localhost:3001'
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS error: Origin ${origin} not allowed`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Home Page');
});
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorMiddleware);

// Start the Server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
