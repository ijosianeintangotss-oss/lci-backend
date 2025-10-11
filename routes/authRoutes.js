// routes/authRoutes.js
const express = require('express');
const { clientRegister, clientLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/client-register', clientRegister);
router.post('/client-login', clientLogin);

module.exports = router;