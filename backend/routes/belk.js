const express = require('express');
const router = express.Router();
const { extractUrls, scrapeUrl } = require('../controllers/belk');

router.post('/extracturls', extractUrls);
router.post('/scrape', scrapeUrl);

module.exports = router;