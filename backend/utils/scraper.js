const axios = require('axios');
const { fetchProductData } = require('./fetchProductData');
const { generateSku } = require('./generateSku');

const apikey = process.env.ZENROWS_API_KEY;
const prefix = process.env.SKU_PREFIX || 'AB-C1';

const fetchBelkHtml = async (url) => {
    url = url.replace('dr-scholl-s', 'dr.-scholls');
    const response = await axios({
        url: 'https://api.zenrows.com/v1/',
        method: 'GET',
        params: {
            url,
            apikey,
            js_render: 'true',
            premium_proxy: 'true',
            proxy_country: 'us',
            custom_headers: true,
            antibot: 'true',
        },
        headers: {
            Referer: 'https://www.google.com',
        },
    });
    return response.data;
};

const scrapeProduct = async (url) => {
    try {
        url = url.split('?')[0];
        const html = await fetchBelkHtml(url);

        const { result, newObj } = await fetchProductData(html);
        console.log(result ? '✓' : '✗', url);

        if (!result || !newObj) return null;

        const name = result?.product_name[0];
        const upc = result?.sku_upc;
        const id = result?.sku_id;
        const price = result?.sku_price;
        const onsale = result?.sku_on_sale;
        const num = result?.sku_inventory;
        const imgurl = result?.sku_image_url;
        const brand = result?.product_brand[0];
        const coupon = result?.product_promotedCoupon?.[0]?.couponCode !== undefined
            ? result.product_promotedCoupon[0].cpnDiscount
            : 0;

        const products = upc.map((u, index) => ({
            vendor: 'belk',
            name,
            upc: u,
            price: !onsale[index]
                ? Number(Number(price[index] * (1 - coupon / 100)).toFixed(2))
                : Number(Number(price[index]).toFixed(2)),
            pricerange: `${Math.min(...price)} - ${Math.max(...price)}`,
            quantity: Number(num[index]),
            productid: id[index],
            color: Array.isArray(newObj[id[index]]) && newObj[id[index]].length > 1 && newObj[id[index]][1] || null,
            size: Array.isArray(newObj[id[index]]) && newObj[id[index]][0] || null,
            sku: generateSku(
                u,
                prefix,
                Array.isArray(newObj[id[index]]) && newObj[id[index]].length > 1 && newObj[id[index]][1] || null,
                Array.isArray(newObj[id[index]]) && newObj[id[index]][0] || null
            ),
            url,
            imgurl: imgurl[index]?.replace('comisimageBelk', 'com/is/image/Belk'),
            brand,
        }));

        return products.filter((p) => p.quantity > 2);

    } catch (err) {
        console.error('Scraper error for', url, ':', err.message);
        return null;
    }
};

// same as scrapeProduct but returns ALL variants including low stock (used for sync)
const scrapeProductAll = async (url) => {
    try {
        url = url.split('?')[0];
        const html = await fetchBelkHtml(url);

        const { result, newObj } = await fetchProductData(html);

        if (!result || !newObj) return null;

        const name = result?.product_name[0];
        const upc = result?.sku_upc;
        const id = result?.sku_id;
        const price = result?.sku_price;
        const onsale = result?.sku_on_sale;
        const num = result?.sku_inventory;
        const imgurl = result?.sku_image_url;
        const brand = result?.product_brand[0];
        const coupon = result?.product_promotedCoupon?.[0]?.couponCode !== undefined
            ? result.product_promotedCoupon[0].cpnDiscount
            : 0;

        return upc.map((u, index) => ({
            vendor: 'belk',
            name,
            upc: u,
            price: !onsale[index]
                ? Number(Number(price[index] * (1 - coupon / 100)).toFixed(2))
                : Number(Number(price[index]).toFixed(2)),
            pricerange: `${Math.min(...price)} - ${Math.max(...price)}`,
            quantity: Number(num[index]),
            productid: id[index],
            color: Array.isArray(newObj[id[index]]) && newObj[id[index]].length > 1 && newObj[id[index]][1] || null,
            size: Array.isArray(newObj[id[index]]) && newObj[id[index]][0] || null,
            sku: generateSku(
                u,
                prefix,
                Array.isArray(newObj[id[index]]) && newObj[id[index]].length > 1 && newObj[id[index]][1] || null,
                Array.isArray(newObj[id[index]]) && newObj[id[index]][0] || null
            ),
            url,
            imgurl: imgurl[index]?.replace('comisimageBelk', 'com/is/image/Belk'),
            brand,
        }));

    } catch (err) {
        console.error('Scraper error for', url, ':', err.message);
        return null;
    }
};

module.exports = { scrapeProduct, scrapeProductAll };