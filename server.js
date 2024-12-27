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

// Security Enhancements (Optional but Recommended)
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();
const port = process.env.PORT || 3001;

// ------------------------------
// 1. Connect to MongoDB
// ------------------------------
connectDB();

// ------------------------------
// 2. Security Middlewares (Optional)
// ------------------------------

// Set security HTTP headers
app.use(helmet());

// Rate Limiting to prevent brute-force attacks and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Data Sanitization against NoSQL injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// ------------------------------
// 3. Logging Middleware
// ------------------------------
app.use(morgan('dev'));

// ------------------------------
// 4. CORS Configuration
// ------------------------------

// Define allowed base domains (without subdomains)
const allowedBaseDomains = [
  'pioneerinstitute.in',
  'pil-admin.site'
];

// Function to check if the origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow requests with no origin (e.g., mobile apps)

  try {
    const hostname = new URL(origin).hostname;

    // Check if hostname is exactly a base domain or a subdomain of it
    return allowedBaseDomains.some(baseDomain => 
      hostname === baseDomain || hostname.endsWith(`.${baseDomain}`)
    );
  } catch (err) {
    console.error('Invalid Origin:', origin);
    return false;
  }
};

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ------------------------------
// 5. Body Parsers
// ------------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ------------------------------
// 6. Serve Static Files
// ------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// If serving a frontend (e.g., React) from the same server
// Adjust the path to your frontend build directory as needed
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// ------------------------------
// 7. API Routes
// ------------------------------
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// ------------------------------
// 8. 404 Handler for API Routes
// ------------------------------
app.use(notFound);

// ------------------------------
// 9. Centralized Error Handler
// ------------------------------
app.use(errorMiddleware);

// ------------------------------
// 10. Catch-All Route for Frontend (SPA)
// ------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// ------------------------------
// 11. Start the Server
// ------------------------------
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// ------------------------------
// 12. Global Error Handlersgit add
// ------------------------------
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
