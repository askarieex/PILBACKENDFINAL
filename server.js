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

// ------------------------------
// 1. Connect to MongoDB
// ------------------------------
connectDB();

// ------------------------------
// 2. Logging Middleware
// ------------------------------
app.use(morgan('dev'));

// ------------------------------
// 3. CORS Configuration
// ------------------------------
const allowedOrigins = [
    'https://pioneerinstitute.in',
    'https://www.pioneerinstitute.in',
    'http://pioneerinstitute.in',
    'https://pil-admin.site',
    'https://www.pil-admin.site',
    'http://pil-admin.site',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001'
];

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

app.use(cors(corsOptions));

// ------------------------------
// 4. Body Parsers
// ------------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ------------------------------
// 5. Static Files
// ------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------
// 6. Routes
// ------------------------------
app.get("/", (req, res) => {
    res.send("Home Page");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// ------------------------------
// 7. 404 Handler
// ------------------------------
app.use(notFound);

// ------------------------------
// 8. Centralized Error Handler
// ------------------------------
app.use(errorMiddleware);

// ------------------------------
// 9. Start the Server
// ------------------------------
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// ------------------------------
// 10. Global Error Handlers
// ------------------------------
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
