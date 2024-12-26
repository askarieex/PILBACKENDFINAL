// backend/server.js
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
app.use(cors({
  origin: [
    'https://pioneerinstitute.in',
    'http://pioneerinstitute.in',
    'https://pil-admin.site',
    'http://pil-admin.site',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// 404 Handler
app.use(notFound);

// Centralized error handler
app.use(errorMiddleware);

// Global error handlers to prevent crashes
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
