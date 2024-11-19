const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Ruta para manejar el login
router.post('/login', loginController.loginUser);

module.exports = router;
