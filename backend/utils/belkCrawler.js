const axios = require('axios');
const cheerio = require('cheerio');
const BrandUrl = require("../models/BrandUrl");
const BrandPage = require("../models/BrandPage");

const apikey = process.env.ZENROWS_API_KEY;

const PREFIX_BY_ACCOUNT = {
    rcube: 'RC-R1',
    om: 'OM-O1',
    bijak: 'BJ-S1',
    zenith: 'RC-R1',
};

const getPrefixForAccount = (account) => PREFIX_BY_ACCOUNT[account] || 'AB-C1';

const generateurl = async (num, url, account) => {
    if (!url.includes('prefn1')) return false;

    const a = url.split('?');
    const b = a[1].split('&');
    const baseUrl = a[0] + '?' + b[1] + '&' + b[2] + '&' + b[0];

    let start = 60;
    const extraPages = Math.floor(num / 60) - 1;
    const urllist = [];

    for (let i = 0; i <= extraPages; i++) {
        urllist.push(`${baseUrl}&start=${start}&sz=60`);
        start += 60;
    }

    if (urllist.length === 0) return false;

    const pages = new BrandPage({ url: urllist, account, vendor: 'belk' });
    await pages.save();
    return true;
};

const scrapfirstpage = async (url) => {
    const response = await axios({
        url: 'https://api.zenrows.com/v1/',
        method: 'GET',
        params: {
            url,
            apikey,
            js_render: true,
            premium_proxy: true,
        },
    });

    const $ = cheerio.load(response.data);
    let productUrls = [];
    $('a.thumb-link').each((_, el) => {
        const href = $(el).attr('href');
        if (href) productUrls.push(href);
    });

    return [...new Set(productUrls)];
};

const handleSecondPageScraping = async (urls) => {
    let i = 0;
    while (i < urls.length) {
        const url = urls[i];
        const response = await axios({
            url: 'https://api.zenrows.com/v1/',
            method: 'GET',
            params: {
                url,
                apikey,
                js_render: true,
                premium_proxy: true,
            },
        });

        const $ = cheerio.load(response.data);
        let productUrls = [];
        $('a.thumb-link').each((_, el) => {
            const href = $(el).attr('href');
            if (href) productUrls.push(href);
        });

        if (productUrls.length > 0) {
            const productarr = productUrls.map((p) => 'https://www.belk.com' + p);
            const prev = await BrandUrl.find();
            const merged = [...new Set([...(prev[0]?.producturl || []), ...productarr])];
            const doc = await BrandUrl.findByIdAndUpdate(
                prev[0]._id,
                { $set: { producturl: merged } },
                { new: true }
            );
            if (doc?.producturl?.length > 0) i++;
        } else {
            i++;
        }
    }
    return i === urls.length;
};

module.exports = { generateurl, scrapfirstpage, handleSecondPageScraping, getPrefixForAccount };