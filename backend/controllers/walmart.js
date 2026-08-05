require('dotenv').config();
const apikey = process.env.API_KEY;
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer-core');

const connectionURL = `wss://browser.zenrows.com?apikey=${apikey}`;

const generatesku = (upc, prefix, color = '', size = '') => {
    let a = size.split(' ');
    if (a[1] && a[1].length > 1) a[1] = a[1].slice(0, 1);
    a = a.join('');
    size = a;
    color = color.replaceAll(' ', '-').replaceAll('/', '-').toUpperCase();
    let firstletter = color.charAt(0);
    color = color.slice(1);
    var modifiedColor = color;
    if (color.length > 12) {
        let v = ['A', 'E', 'I', 'O', 'U'];
        for (let i of v) {
            modifiedColor = color.replaceAll(i, '');
            color = modifiedColor;
        }
    }
    if (color.length > 12) {
        let arr = color.split('-');
        for (let i = 0; i < arr.length; i++) arr[i] = arr[i].slice(0, 3);
        color = arr.join('-');
    }
    let sku = prefix + '-' + upc + '-' + firstletter + color + '-' + size;
    sku = sku.replaceAll('---', '-').replaceAll('--', '-').replaceAll(',', '');
    return sku;
};

async function scrapeProductFromUrl(url, prefix = 'RC-R3') {
    const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    const html = await page.content();
    const $ = cheerio.load(html);
    await page.close();
    await browser.disconnect();

    let variantUrls = [];
    const schemaScript = $('script[data-seo-id="schema-org-product"]').html()?.trim();
    if (schemaScript) {
        try {
            const parsed = JSON.parse(schemaScript);
            const variants = parsed?.[0]?.hasVariant || [];
            variants.shift();
            variantUrls = variants.map(v => v.url);
        } catch (err) {
            console.error('Schema parse error:', err.message);
        }
    }

    const nextDataScript = $('script#__NEXT_DATA__').html()?.trim();
    if (!nextDataScript) throw new Error('__NEXT_DATA__ not found');

    const jsonData = JSON.parse(nextDataScript);
    const data = jsonData?.props?.pageProps?.initialData?.data?.product;
    const clrszdata = jsonData?.props?.pageProps?.initialData?.data?.idml?.specifications;

    if (!data) throw new Error('Product data not found');

    const quantity = data?.fulfillmentOptions?.[0]?.orderLimit || 0;
    let color = '';
    let size = '';
    const varient = data.selectedVariantIds || [];

    if (varient.length === 1 && varient[0].includes('_size-')) size = varient[0].split('-')[1];
    if (varient.length === 1 && varient[0].includes('_color-')) color = varient[0].split('-')[1];
    if (varient.length > 1) {
        const sizeVar = varient.find(v => v.includes('_size-'));
        const colorVar = varient.find(v => v.includes('_color-'));
        if (sizeVar) size = sizeVar.split('-')[1];
        if (colorVar) color = colorVar.split('-')[1];
    }
    if (color === '' && clrszdata) {
        const pcolor = clrszdata.find(d => d.name === 'Color');
        color = pcolor?.value || '';
    }
    if (size === '' && clrszdata) {
        const psize = clrszdata.find(d => d?.name.includes('Size'));
        size = psize?.value || '';
    }

    const product = {
        vendor: 'walmart',
        brand: data?.brand?.toLowerCase() || '',
        productid: data?.id,
        upc: data?.upc,
        sku: generatesku(data.upc, prefix, color, size),
        price: data?.conditionOffers?.[0]?.price?.price,
        available: data?.availabilityStatus,
        quantity: Number(quantity),
        name: data?.name,
        url: 'https://www.walmart.com' + data?.canonicalUrl,
        type: data?.type,
        color,
        size,
        imgurl: data?.imageInfo?.thumbnailUrl,
    };

    return { product, variantUrls };
}

async function scrapeWalmartProduct(url, prefix = 'RC-R3') {
    const products = [];

    if (!url.includes('?') && !url.includes('%')) {
        // Single variant
        const variantUrl = url + '?classType=VARIANT&adsRedirect=true';
        const { product } = await scrapeProductFromUrl(variantUrl, prefix);
        products.push(product);
    } else {
        // Parent + all variants
        const { product: parentProduct, variantUrls } = await scrapeProductFromUrl(url, prefix);
        products.push(parentProduct);

        await Promise.all(variantUrls.map(async (variantPath) => {
            const variantUrl = variantPath + '?classType=VARIANT&adsRedirect=true';
            try {
                const { product: variantProduct } = await scrapeProductFromUrl(variantUrl, prefix);
                products.push(variantProduct);
            } catch (err) {
                console.error('Variant error:', variantUrl, err.message);
            }
        }));
    }

    return products;
}

function extractProductData(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const anchors = document.querySelectorAll('div.pr4-xl div.hide-child-opacity a.hide-sibling-opacity');
    const brandDiv = document.querySelectorAll('div.mb1.mt2.b.f6.black.mr1.lh-solid');

    let brands = Array.from(brandDiv).map(brand => brand.textContent.trim()).filter(Boolean);
    brands = [...new Set(brands)];

    let hrefs = Array.from(anchors).map(anchor => anchor.href).filter(Boolean);
    hrefs = hrefs.map(h => h.includes('https://www.walmart.com') ? h : 'https://www.walmart.com' + h);

    return { hrefs, brands };
}

module.exports = { scrapeWalmartProduct, extractProductData };