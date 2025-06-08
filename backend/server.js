require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const corsMiddleware = require('./middlewares/corsMiddleware');
const cookieParser = require('cookie-parser');
const path = require('path');

// routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const caseRoutes = require('./routes/caseRoutes');
const commonRoutes = require('./routes/commonRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());

// Serve uploaded profile images statically
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/common', commonRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});