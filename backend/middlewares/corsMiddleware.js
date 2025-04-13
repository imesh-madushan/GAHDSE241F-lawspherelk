const cors = require("cors");
require('dotenv').config();

const originURL = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';
const allowedOrigins = originURL.split(',').map(origin => origin.trim());

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
    exposedHeaders: [
        "Set-Cookie",
        "Authorization"
    ]
};

module.exports = cors(corsOptions);