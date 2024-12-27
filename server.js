// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Your custom modules
const connectDB = require("./config/db");
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const errorMiddleware = require('./middlewares/errorMiddleware');
const { notFound } = require('./handlers/errorHandlers');

const app = express();
const port = process.env.PORT || 3001;

// 1) Connect to MongoDB
connectDB();

// 2) Logger
app.use(morgan('dev'));

// 3) CORS
app.use(cors({
  origin: [
    'https://pil-admin.site',
    'http://pil-admin.site',
    'https://pioneerinstitute.in',
    'http://pioneerinstitute.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 4) Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 5) Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6) Simple Test Route
app.get('/', (req, res) => {
  res.send('API is running on Node/Express!');
});

// 7) Actual Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// 8) 404 Handler
app.use(notFound);

// 9) Centralized Error Handler
app.use(errorMiddleware);

// 10) Start Server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// 11) Graceful Shutdown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
