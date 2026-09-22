const mongoose = require('mongoose');

const brandUrlSchema = new mongoose.Schema({
    producturl: { type: [String], default: [] },
    vendor: String,
    account: String,
    brand: String,
    Date: { type: String, default: () => new Date().toLocaleString() },
});

module.exports = mongoose.model('BrandUrl', brandUrlSchema);