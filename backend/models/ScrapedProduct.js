const mongoose = require('mongoose');

const scrapedProductSchema = new mongoose.Schema({
    account: String,
    vendor: String,
    upc: String,
    productid: String,
    price: Number,
    pricerange: Array,
    quantity: Number,
    color: String,
    size: String,
    sku: String,
    imgurl: String,
    url: String,
    Brand: String,
    belkTitle: String,
    available: String,
    producttype: String,
});

module.exports = mongoose.model('Product', scrapedProductSchema);