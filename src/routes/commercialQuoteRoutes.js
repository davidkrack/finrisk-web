const express = require('express');
const router = express.Router();
const commercialQuoteController = require('../controllers/commercialQuoteController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, commercialQuoteController.showCommercialQuote);

module.exports = router;
