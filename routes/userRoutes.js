// routes/userRoutes.js

const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
// router.put('/:id/status', updateUserStatus);

module.exports = router;