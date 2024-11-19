const express = require('express');
const router = express.Router();
const webQuoteController = require('../controllers/webQuoteController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, webQuoteController.showWebQuote);

module.exports = router;
