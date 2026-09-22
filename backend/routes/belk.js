const express = require('express');
const router = express.Router();
const {
    extractUrls,
    scrapeUrl,
    fetchBrand,
    refreshDetails,
    currentDetails,
    deleteUrl,
    deleteOldUrls,
    downloadProductExcel,
} = require('../controllers/belk');

router.post('/extracturls', extractUrls);
router.post('/scrape', scrapeUrl);
router.post('/fetchbrand', fetchBrand);
router.post('/refreshdetails', refreshDetails);
router.post('/currentdetails', currentDetails);
router.post('/deleteurl', deleteUrl);
router.post('/deleteoldurls', deleteOldUrls);
router.post('/downloadproductexcel', downloadProductExcel);

module.exports = router;