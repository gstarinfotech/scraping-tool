const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { startSync, syncProgress, downloadSync } = require('../controllers/sync');

router.post('/sync', upload.single('file'), startSync);
router.get('/sync/progress/:jobId', syncProgress);
router.get('/sync/download/:jobId', downloadSync);

module.exports = router;