const express = require('express');
const router = express.Router();
const controlPanelController = require('../controllers/controlPanelController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, controlPanelController.showControlPanel);

module.exports = router;
