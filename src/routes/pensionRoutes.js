const express = require('express');
const router = express.Router();
const pensionController = require('../controllers/pensionController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/calculo-pension', isAuthenticated, pensionController.calculoPension);

module.exports = router;
