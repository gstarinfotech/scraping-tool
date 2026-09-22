const { JSDOM } = require('jsdom');
const { scrapeProduct } = require('../utils/scraper');
const { generateurl, scrapfirstpage, handleSecondPageScraping } = require('../utils/belkCrawler');
const BrandUrl = require('../models/BrandUrl');
const BrandPage = require('../models/BrandPage');
const ScrapedProduct = require('../models/ScrapedProduct');
const ScrapedBrand = require('../models/ScrapedBrand');

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

const fetchBrand = async (req, res) => {
    try {
        const { url, num, brandname, account, name, email } = req.body;

        if (!account) {
            return res.status(400).json({ status: false, msg: 'Account is required' });
        }

        // fresh run: clear anything queued for this account/vendor before re-fetching
        await Promise.all([
            BrandPage.deleteMany({ account, vendor: 'belk' }),
            BrandUrl.deleteMany({ account, vendor: 'belk' }),
        ]);

        if (num > 60) {
            await generateurl(num, url, account);
        }

        const productUrls = await scrapfirstpage(url);

        if (productUrls.length === 0) {
            return res.status(404).json({ status: false, msg: 'No url fetched or found. Please retry' });
        }

        const productarr = productUrls.map((p) => 'https://www.belk.com' + p);
        const brandUrlDoc = new BrandUrl({ producturl: productarr, account, vendor: 'belk', brand: brandname });
        await brandUrlDoc.save();

        if (num > 60) {
            const pages = await BrandPage.find({ account, vendor: 'belk' }, { url: 1, _id: 0 });
            if (pages.length > 0) {
                const ok = await handleSecondPageScraping(pages[0].url);
                if (!ok) {
                    return res.status(500).json({
                        status: false,
                        msg: 'Error while scraping later pages. Refresh to see how many urls were fetched, then retry if incomplete.',
                    });
                }
            }
        }

        const saved = await BrandUrl.findOne({ account, vendor: 'belk' });
        const urls = saved ? saved.producturl : [];

        await new ScrapedBrand({ name, email, account, vendor: 'belk', brandname, brandurl: url, urls: urls.length }).save();

        res.status(200).json({ status: true, url: urls, msg: "All pages's urls fetched successfully" });
    } catch (err) {
        console.error('fetchBrand error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const refreshDetails = async (req, res) => {
    try {
        const { account } = req.body;
        const pages = await BrandPage.findOne({ account, vendor: 'belk' });
        const urls = await BrandUrl.findOne({ account, vendor: 'belk' });

        res.status(200).json({ status: true, page: pages?.url?.length || 0, url: urls?.producturl?.length || 0 });
    } catch (err) {
        console.error('refreshDetails error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const currentDetails = async (req, res) => {
    try {
        const { account } = req.body;
        const totalurl = await BrandUrl.findOne({ account, vendor: 'belk' });
        const fetchedproduct = await ScrapedProduct.countDocuments({ account, vendor: 'belk' });

        if (!totalurl) {
            return res.status(404).json({ status: '404', msg: 'No previous data found' });
        }

        res.status(200).json({
            status: true,
            url: totalurl.producturl.length,
            fetched: fetchedproduct,
            link: totalurl.producturl,
        });
    } catch (err) {
        console.error('currentDetails error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const deleteUrl = async (req, res) => {
    try {
        const { account, url } = req.body;
        const resp = await BrandUrl.findOneAndUpdate(
            { account, vendor: 'belk' },
            { $pull: { producturl: url } },
            { new: true }
        );
        if (resp) return res.status(200).json({ status: true, data: resp.producturl });
        res.status(404).json({ status: false, msg: 'Not found' });
    } catch (err) {
        console.error('deleteUrl error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const deleteOldUrls = async (req, res) => {
    try {
        const { account } = req.body;
        const urls = await BrandUrl.deleteMany({ account, vendor: 'belk' });
        const products = await ScrapedProduct.deleteMany({ account, vendor: 'belk' });

        res.status(200).json({ status: true, urls: urls.deletedCount, products: products.deletedCount });
    } catch (err) {
        console.error('deleteOldUrls error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

const downloadProductExcel = async (req, res) => {
    try {
        const { account } = req.body;
        const products = await ScrapedProduct.find({ account, vendor: 'belk' });

        if (products.length === 0) {
            return res.status(404).json({ status: false, msg: 'No data found' });
        }

        res.status(200).json({ status: true, data: products });
    } catch (err) {
        console.error('downloadProductExcel error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

module.exports = {
    extractUrls,
    scrapeUrl,
    fetchBrand,
    refreshDetails,
    currentDetails,
    deleteUrl,
    deleteOldUrls,
    downloadProductExcel,
};