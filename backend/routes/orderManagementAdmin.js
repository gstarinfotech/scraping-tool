const express = require('express');
const router = express.Router();

const {
    login,
    sendotp,
    signup,
    getprofile,
    verifyotp,
} = require('../controllers/orderManagementAdmin');

router.post('/signup', signup);
router.post('/login', login);
router.post('/sendotp', sendotp);
router.post('/verifyotp', verifyotp);
router.get('/getprofile', getprofile);

module.exports = router;