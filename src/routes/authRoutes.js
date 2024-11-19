const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para manejar el login
router.post('/login', authController.login);

// Ruta para manejar el logout
router.post('/logout', authController.logout);

module.exports = router;

