const express = require('express');
const router = express.Router();
const { extractProductData, scrapeWalmartProduct } = require('../controllers/walmart');

router.post('/extracturls', extractProductData);
router.post('/scrape', scrapeWalmartProduct);

module.exports = router;