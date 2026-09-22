const Product2 = require('../models/Order');

const deleteentry = async (req, res) => {
    try {
        const { id } = req.body;
        const resp = await Product2.deleteOne({ _id: id });
        if (resp.acknowledged) {
            res.status(200).json({ status: true });
        } else {
            res.status(404).json({ status: false, msg: 'Entry not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const getcarddetails = async (req, res) => {
    try {
        const { account } = req.body;
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);

        const todayproduct = await Product2.find({ account, createdAt: { $gte: sd, $lte: ed } });
        const untrackable = await Product2.countDocuments({ account, 'Vendor Tracking #': '' });
        const nopdf = await Product2.countDocuments({ account, pdf: { $eq: '' } });
        const unshipped = await Product2.countDocuments({
            account,
            'Vendor Tracking #': { $ne: '' },
            pdf: { $ne: '' },
            'Date Shipped': '',
        });
        const returnproduct = await Product2.countDocuments({ account, 'Vendor Return': { $type: 'string' } });

        const lastDate = new Date().toISOString().slice(0, 10);
        const deadline = await Product2.countDocuments({ account, 'last date': lastDate, status: '' });

        const data = [
            { id: 1, title: "Today's Entry", description: todayproduct.length, img: '/static/todayentry.png', sub: 'Current day entry' },
            { id: 2, title: 'Untrackable', description: untrackable, img: '/static/untrackable.png', sub: 'Update tracking id' },
            { id: 3, title: 'PDF Require', description: nopdf, img: '/static/pdf.png', sub: 'Upload pdf' },
            { id: 4, title: 'Unshipped', description: unshipped, img: '/static/unshipped.png', sub: 'Prep center use' },
            { id: 5, title: 'Return', description: returnproduct, img: '/static/return.png', sub: 'Return product' },
            { id: 6, title: 'Deadline', description: deadline, img: '/static/deadline.png', sub: 'Urgent action needed' },
        ];

        res.status(200).json({ status: true, data, todayEntry: todayproduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const getadmincarddetails = async (req, res) => {
    try {
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);

        const todayproduct = await Product2.find({ createdAt: { $gte: sd, $lte: ed } });
        const untrackable = await Product2.countDocuments({ 'Vendor Tracking #': { $ne: '' } });
        const nopdf = await Product2.countDocuments({ pdf: { $eq: '' } });
        const unshipped = await Product2.countDocuments({ 'Vendor Tracking #': '' });
        const returnproduct = await Product2.countDocuments({ 'Vendor Return': { $ne: '' } });

        const lastDate = new Date().toISOString().slice(0, 10);
        const deadline = await Product2.countDocuments({ 'last date': lastDate, status: '' });

        const data = [
            { id: 1, title: "Today's Entry", description: todayproduct.length, img: '/static/todayentry.png', sub: 'Current day entry' },
            { id: 2, title: 'Untrackable', description: untrackable, img: '/static/untrackable.png', sub: 'Update tracking id' },
            { id: 3, title: 'PDF Require', description: nopdf, img: '/static/pdf.png', sub: 'Upload pdf' },
            { id: 4, title: 'Unshipped', description: unshipped, img: '/static/unshipped.png', sub: 'Prep center use' },
            { id: 5, title: 'Return', description: returnproduct, img: '/static/return.png', sub: 'Return product' },
            { id: 6, title: 'Deadline', description: deadline, img: '/static/deadline.png', sub: 'Urgent action needed' },
        ];

        res.status(200).json({ status: true, data, todayentry: todayproduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const getprepcentercard = async (req, res) => {
    try {
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);

        const todayproduct = await Product2.find({
            status: { $in: ['shipped', 'return'] },
            createdAt: { $gte: sd, $lte: ed },
        });
        const unshipped = await Product2.countDocuments({ 'Vendor Tracking #': { $ne: '' }, pdf: { $ne: '' }, status: '' });
        const returnproduct = await Product2.countDocuments({ 'Vendor Return': { $ne: '' } });

        const lastDate = new Date().toISOString().slice(0, 10);
        const deadline = await Product2.countDocuments({ 'last date': lastDate, status: '' });

        const data = [
            { id: 1, title: 'Shipped Today', description: todayproduct.length, img: '/static/todayentry.png', sub: 'Current day Shipment' },
            { id: 2, title: 'Unshipped', description: unshipped, img: '/static/unshipped.png', sub: 'Prep center use' },
            { id: 3, title: 'Return', description: returnproduct, img: '/static/return.png', sub: 'Return product' },
            { id: 4, title: 'Deadline', description: deadline, img: '/static/deadline.png', sub: 'Urgent action needed' },
        ];

        res.status(200).json({ status: true, data, todayentry: todayproduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const search = async (req, res) => {
    try {
        const { key, searchby } = req.body;
        if (!key || !searchby) {
            return res.status(400).json({ status: false, msg: 'Missing search key or field' });
        }

        const result = await Product2.find({ [searchby]: key });
        res.status(200).json({ status: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const untrackable = async (req, res) => {
    try {
        const { account } = req.body;
        const data = await Product2.find({ account, 'Vendor Tracking #': '' });
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const pdfrequire = async (req, res) => {
    try {
        const { account } = req.body;
        const data = await Product2.find({ account, pdf: '' });
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const deadline = async (req, res) => {
    try {
        const { account } = req.body;
        const lastDate = new Date().toISOString().slice(0, 10);
        const query = account ? { account, 'last date': lastDate, status: '' } : { 'last date': lastDate, status: '' };

        const data = await Product2.find(query);
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const returned = async (req, res) => {
    try {
        const { account } = req.body;
        const query = account ? { account, 'Vendor Return': { $type: 'string' } } : { 'Vendor Return': { $ne: '' } };

        const data = await Product2.find(query);
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const updatetrackingid = async (req, res) => {
    try {
        const { id, trackingid } = req.body;
        const resp = await Product2.findByIdAndUpdate(
            { _id: id },
            { $set: { 'Vendor Tracking #': trackingid } },
            { new: true }
        );
        if (resp && resp['Vendor Tracking #']) {
            res.status(200).json({ status: true, asin: resp.ASINs });
        } else {
            res.status(404).json({ status: false, msg: 'Error while updating' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const unshipped = async (req, res) => {
    try {
        const { account } = req.body;
        const query = account
            ? { account, 'Vendor Tracking #': { $ne: '' }, pdf: { $ne: '' }, status: '' }
            : { 'Vendor Tracking #': { $ne: '' }, pdf: { $ne: '' }, status: '' };

        const data = await Product2.find(query);
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const todayentry = async (req, res) => {
    try {
        const { account } = req.body;
        const sd = new Date();
        sd.setHours(0, 0, 0, 0);
        const ed = new Date();
        ed.setHours(23, 59, 59, 999);

        const query = { createdAt: { $gte: sd, $lte: ed } };
        if (account) query.account = account;

        const data = await Product2.find(query);
        if (data.length > 0) {
            res.status(200).json({ status: true, data });
        } else {
            res.status(404).json({ status: 'notfound', msg: 'No data found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const datewise = async (req, res) => {
    try {
        const { startDate, endDate, account } = req.body;
        const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));

        const query = { createdAt: { $gte: start, $lte: end } };
        if (account) query.account = account;

        const data = await Product2.find(query);
        res.status(200).json({ status: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

// used by prep-center flow: mark an order shipped/returned
const changestatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const date = new Date().toLocaleString();
        const updated = await Product2.findByIdAndUpdate(
            { _id: id },
            { $set: { status, 'Date Shipped': date } },
            { new: true }
        );
        if (updated) {
            res.status(200).json({ status: true, asin: updated.ASINs, order: updated });
        } else {
            res.status(404).json({ status: false, msg: 'Entry not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const getsavedentry = async (req, res) => {
    try {
        const { account } = req.body;
        const data = await Product2.find({ account });
        res.status(200).json({ status: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

// account is auto-detected from the SKU prefix: RC->rcube, BJ->bijak, ZL->zenith, OM->om
const detectAccount = (sku) => {
    if (!sku) return null;
    const s = sku.trim().toUpperCase();
    if (s.startsWith('RC')) return 'rcube';
    if (s.startsWith('BJ')) return 'bijak';
    if (s.startsWith('ZL')) return 'zenith';
    if (s.startsWith('OM')) return 'om';
    return null;
};

const addproduct = async (req, res) => {
    try {
        const { product, id: employeeid, editid } = req.body;
        const account = detectAccount(product?.['SKUs to match']);

        if (!account) {
            return res.status(404).json({ status: 'invalid', msg: 'Please check sku. That should start with only- RC/ZL/OM/BJ' });
        }

        if (editid) {
            await Product2.findOneAndDelete({ _id: editid });
        }

        const data = { ...product, entryby: employeeid, account };
        const newProduct = new Product2(data);
        const savedProduct = await newProduct.save();

        res.status(200).json({ status: true, data: savedProduct, msg: 'Product details added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

// bulk upload (Upload Center) — de-dupes by Amazon Order id + Row #
const savenewdata = async (req, res) => {
    try {
        const { data, name } = req.body;
        const account = data?.length > 0 ? detectAccount(data[0]['SKUs to match']) : null;

        if (!account) {
            return res.status(404).json({ status: 'invalid', msg: 'Please check sku. That should start with only- RC/ZL/OM/BJ' });
        }

        let count = 0;
        let existingCount = 0;

        for (const row of data) {
            const entry = { ...row, entryby: name, account };
            const existing = await Product2.find({ 'Amazon Order id': entry['Amazon Order id'] });

            if (existing.length > 0) {
                const existingRows = existing.map((e) => e['Row #']);
                if (!existingRows.includes(Number(entry['Row #']))) {
                    await new Product2(entry).save();
                    count += 1;
                } else {
                    existingCount += 1;
                }
            } else {
                await new Product2(entry).save();
                count += 1;
            }
        }

        if (count > 0) {
            res.status(200).json({ status: true, count, existingCount });
        } else {
            res.status(404).json({ status: false, msg: 'No new Data found or saved' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

module.exports = {
    deleteentry,
    getcarddetails,
    getadmincarddetails,
    getprepcentercard,
    search,
    untrackable,
    pdfrequire,
    deadline,
    returned,
    updatetrackingid,
    unshipped,
    todayentry,
    datewise,
    changestatus,
    getsavedentry,
    addproduct,
    savenewdata,
};
