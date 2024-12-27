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

// Optional Security Enhancements
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();
const port = process.env.PORT || 3001;

// ------------------------------
// 1. Connect to MongoDB
// ------------------------------
connectDB();

// ------------------------------
// 2. Security Middlewares
// ------------------------------
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// ------------------------------
// 3. Logging Middleware
// ------------------------------
app.use(morgan('dev'));

// ------------------------------
// 4. Body Parsers
// ------------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ------------------------------
// 5. CORS Configuration
// ------------------------------

// Define allowed origins
const allowedOrigins = [
    'https://pil-admin.site',
    'https://www.pil-admin.site',
    'https://pioneerinstitute.in',
    'https://www.pioneerinstitute.in'
];

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
// app.use(cors(corsOptions));

// ------------------------------
// 6. Static Files
// ------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("Askery new")
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
// 10. Start the Server
// ------------------------------
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// ------------------------------
// 11. Global Error Handlers
// ------------------------------
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
