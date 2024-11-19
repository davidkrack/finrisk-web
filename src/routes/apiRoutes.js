const express = require('express');
const apiController = require('../controllers/apiController'); // Asegúrate de que apiController esté correctamente exportado
const router = express.Router();

// Ruta para la API de cálculo de pensiones
router.post('/calculo-pension', apiController.calculatePension);

module.exports = router;
