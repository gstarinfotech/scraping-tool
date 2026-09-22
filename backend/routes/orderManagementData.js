const express = require('express');
const router = express.Router();

const {
    getsavedentry,
    savenewdata,
    addproduct,
    getcarddetails,
    getadmincarddetails,
    todayentry,
    datewise,
    returned,
    getprepcentercard,
    deleteentry,
    changestatus,
    search,
    untrackable,
    updatetrackingid,
    unshipped,
    pdfrequire,
    deadline,
} = require('../controllers/orderManagementData');

router.post('/addproduct', addproduct);
router.post('/getcarddetails', getcarddetails);
router.post('/search', search);
router.delete('/deleteentry', deleteentry);
router.post('/untrackable', untrackable);
router.post('/pdfrequire', pdfrequire);
router.post('/unshipped', unshipped);
router.post('/returned', returned);
router.post('/deadline', deadline);
router.post('/todayentry', todayentry);
router.post('/datewise', datewise);
router.put('/updatetrackingid', updatetrackingid);
router.get('/getadmincarddetails', getadmincarddetails);
router.post('/getprepcentercard', getprepcentercard);
router.post('/getsavedentry', getsavedentry);
router.post('/savenewdata', savenewdata);
router.put('/changestatus', changestatus);

module.exports = router;
