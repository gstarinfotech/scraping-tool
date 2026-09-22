const mongoose = require('mongoose');

const brandPageSchema = new mongoose.Schema(
    {
        url: { type: [String] },
        account: String,
        vendor: String,
        brand: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('BrandPage', brandPageSchema);