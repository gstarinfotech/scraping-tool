const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    sendotp,
    verifyotp,
    getprofile,
    addsecretkey,
    addsheetdetails,
    addclientid,
} = require('../controllers/orderManagementEmployee');

router.post('/login', login);
router.post('/sendotp', sendotp);
router.post('/verifyotp', verifyotp);
router.post('/signup', signup);
router.post('/addsecretkey', addsecretkey);
router.post('/addsheetdetails', addsheetdetails);
router.post('/addclientid', addclientid);
router.get('/getprofile', getprofile);

module.exports = router;
