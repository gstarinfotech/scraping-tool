const cheerio = require('cheerio');

function fetchBoscovData(html) {
    const $ = cheerio.load(html);
    const scriptTag = $('#data-mz-preload-product');

    if (!scriptTag.length) {
        console.error('Script tag #data-mz-preload-product not found');
        return null;
    }

    let productData;
    try {
        productData = JSON.parse(scriptTag.html().trim());
    } catch (error) {
        console.error('Error parsing Boscovs JSON:', error);
        return null;
    }

    const volumePriceBands = productData?.volumePriceBands || null;
    const upCs = productData?.upCs || [];
    const variations = productData?.variations || [];
    const img = productData?.mainImage?.src || null;
    const brand = productData?.properties?.[22]?.values?.[0]?.stringValue || '';

    return { volumePriceBands, upCs, variations, img, brand };
}

module.exports = { fetchBoscovData };