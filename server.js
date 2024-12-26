require('dotenv').config();
const express = require('express');
const connectDB = require("./config/db");
const morgan = require('morgan');
const cors = require('cors');
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const errorMiddleware = require('./middlewares/errorMiddleware');
const { notFound } = require('./handlers/errorHandlers');
const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('dev'));

// CORS Configuration
const allowedOrigins = [
  'https://pioneerinstitute.in',
  'http://pioneerinstitute.in',
  'https://pil-admin.site',
  'http://pil-admin.site',
  'http://localhost:3002',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // Handle preflight requests
  }
  next();
});

// Body Parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorMiddleware);

// Global Error Handlers
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
