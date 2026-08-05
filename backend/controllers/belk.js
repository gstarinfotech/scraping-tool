const { JSDOM } = require('jsdom');
const { scrapeProduct } = require('../utils/scraper');

const extractUrls = (req, res) => {
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ status: false, msg: 'No HTML provided' });

        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const productContainers = doc.querySelectorAll('div.relative.group\\/image');
        let urls = Array.from(productContainers)
            .map(div => div.querySelector('a')?.href)
            .filter(Boolean);

        urls = urls.map(u => 'https://www.belk.com/p/' + u.split('/p/')[1]?.split('?')[0]).filter(Boolean);
        urls = [...new Set(urls)];

        if (urls.length === 0) return res.status(404).json({ status: false, msg: 'No URLs found' });

        res.status(200).json({ status: true, urls, count: urls.length });
    } catch (err) {
        console.error('extractUrls error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const scrapeUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ status: false, msg: 'No URL provided' });

        const products = await scrapeProduct(url);

        if (!products || products.length === 0) {
            return res.status(200).json({ status: false, msg: 'No products found', url });
        }

        res.status(200).json({ status: true, products, url });
    } catch (err) {
        console.error('scrapeUrl error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

module.exports = { extractUrls, scrapeUrl };