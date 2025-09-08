const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const quoteRoutes = require('./routes/quoteRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET','POST','PUT'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/quotes', quoteRoutes);
app.use('/api/messages', messageRoutes);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
