// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const quoteRoutes = require('./routes/quoteRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quotes', quoteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.listen(port, () => console.log(`Server running on https://lcirwanda-backend001.onrender.com:${port}`));



