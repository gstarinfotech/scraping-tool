const express = require('express');
const router = express.Router();
const { getCredits } = require('../controllers/credits');

router.get('/credits', getCredits);

module.exports = router;