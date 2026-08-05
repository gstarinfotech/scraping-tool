const axios = require('axios');
const { fetchBoscovData } = require('./fetchBoscovData');
const { generateSku } = require('./generateSku');

const apikey = process.env.ZENROWS_API_KEY;
const prefix = process.env.SKU_PREFIX || 'AB-C1';

const fetchBoscovHtml = async (url) => {
    const zenrowsUrl = `https://api.zenrows.com/v1/?apikey=${apikey}&url=${encodeURIComponent(url)}&premium_proxy=true&js_render=true&wait=10000`;
    const response = await axios.get(zenrowsUrl);
    const html = response.data;
    if (html.includes('data-mz-preload-product')) return html;
    console.log(`data-mz-preload-product not found for ${url}`);
    return null;
};

const scrapeBoscovProduct = async (url) => {
    try {
        url = url.split('?')[0];

        const html = await fetchBoscovHtml(url);
        if (!html) return null;

        const productData = fetchBoscovData(html);
        if (!productData) return null;

        const { volumePriceBands, variations, img, brand } = productData;

        if (volumePriceBands && volumePriceBands.length > 0) {
            if (volumePriceBands[0].priceRange) {
                const p = volumePriceBands[0].priceRange;
                const lower = p.lower.onSale ? p.lower.salePrice : p.lower.price;
                const upper = p.upper.onSale ? p.upper.salePrice : p.lower.price;
                const middle = volumePriceBands[0].price.onSale
                    ? volumePriceBands[0].price.salePrice
                    : volumePriceBands[0].price.price;
                price = upper;
                priceRange = [lower, middle, upper].filter((a, i, self) => self.indexOf(a) === i);
            } else {
                price = volumePriceBands[0].price.onSale
                    ? volumePriceBands[0].price.salePrice
                    : volumePriceBands[0].price.price;
                priceRange = [price];
            }
        }

        const products = variations.map((p) => ({
            vendor: 'boscovs',
            upc: p.upc,
            price,
            sku: generateSku(p.upc, prefix, p.options?.[0]?.value, p.options?.[1]?.value),
            pricerange: priceRange.join(' - '),
            quantity: p.inventoryInfo?.onlineStockAvailable || 0,
            color: p.options?.[0]?.value || null,
            size: p.options?.[1]?.value || null,
            imgurl: img,
            url,
            brand,
            name: brand,
        }));

        return products.filter(p => p.quantity > 2);

    } catch (err) {
        console.error('Boscovs scraper error for', url, ':', err.message);
        return null;
    }
};

const scrapeBoscovProductAll = async (url) => {
    try {
        url = url.split('?')[0];

        const html = await fetchBoscovHtml(url);
        if (!html) return null;

        const productData = fetchBoscovData(html);
        if (!productData) return null;

        const { volumePriceBands, variations, img, brand } = productData;

        let price = 0;
        let priceRange = [];

        if (volumePriceBands && volumePriceBands.length > 0) {
            if (volumePriceBands[0].priceRange) {
                const p = volumePriceBands[0].priceRange;
                const lower = p.lower.onSale ? p.lower.salePrice : p.lower.price;
                const upper = p.upper.onSale ? p.upper.salePrice : p.lower.price;
                const middle = volumePriceBands[0].price.onSale
                    ? volumePriceBands[0].price.salePrice
                    : volumePriceBands[0].price.price;
                price = upper;
                priceRange = [lower, middle, upper].filter((a, i, self) => self.indexOf(a) === i);
            } else {
                price = volumePriceBands[0].price.onSale
                    ? volumePriceBands[0].price.salePrice
                    : volumePriceBands[0].price.price;
                priceRange = [price];
            }
        }

        return variations.map((p) => ({
            vendor: 'boscovs',
            upc: p.upc,
            price,
            sku: generateSku(p.upc, prefix, p.options?.[0]?.value, p.options?.[1]?.value),
            pricerange: priceRange.join(' - '),
            quantity: p.inventoryInfo?.onlineStockAvailable || 0,
            color: p.options?.[0]?.value || null,
            size: p.options?.[1]?.value || null,
            imgurl: img,
            url,
            brand,
            name: brand,
        }));

    } catch (err) {
        console.error('Boscovs scraper error for', url, ':', err.message);
        return null;
    }
};

module.exports = { scrapeBoscovProduct, scrapeBoscovProductAll };