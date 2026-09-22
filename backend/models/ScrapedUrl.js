const mongoose = require('mongoose');

const scrappedUrlSchema = new mongoose.Schema({
    url: String,
    account: String,
    vendor: String,
    brand: String,
    Date: { type: String, default: () => new Date().toLocaleString() },
});

module.exports = mongoose.model('Scrappedurl', scrappedUrlSchema);