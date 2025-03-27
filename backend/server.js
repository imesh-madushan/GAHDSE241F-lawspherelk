require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const corsMiddleware = require('./middlewares/corsMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(corsMiddleware);

app.use('/api/auth', authRoutes);
// app.use('/api/auth/login', loginLimmiter);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});