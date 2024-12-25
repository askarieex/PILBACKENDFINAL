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
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: ['https://pioneerinstitute.in','http://pil-admin.site','http://localhost:3002', 'http://localhost:3000','http://localhost:3001'], // Allow both origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies or authentication headers
}));
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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
