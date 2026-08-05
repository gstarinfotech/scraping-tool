const ExcelJS = require('exceljs');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { scrapeProductAll } = require('../utils/scraper');
const { createJob, updateJob, getJob, deleteJob } = require('../utils/jobStore');
const { trackCredits } = require('./credits');

const BATCH_SIZE = 100;
const PRODUCT_LINK_COL = 5;  // E
const PRODUCT_PRICE_COL = 15; // O
const INPUT_UPC_COL = 8;      // H

// SSE clients map: jobId -> res
const sseClients = new Map();

// POST /api/belk/sync — upload file, start job
const startSync = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ status: false, msg: 'No file uploaded' });

        const jobId = uuidv4();
        createJob(jobId);

        res.status(200).json({ status: true, jobId });

        // run sync in background (don't await)
        runSync(jobId, file.path).catch(err => {
            console.error('Sync background error:', err);
            updateJob(jobId, { status: 'error', error: err.message });
            emitToClient(jobId, 'error', { msg: err.message });
        });

    } catch (err) {
        console.error('startSync error:', err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

// GET /api/belk/sync/progress/:jobId — SSE stream
const syncProgress = (req, res) => {
    const { jobId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.set(jobId, res);

    // send current state immediately if job already started
    const job = getJob(jobId);
    if (job) {
        res.write(`data: ${JSON.stringify(job)}\n\n`);
    }

    req.on('close', () => {
        sseClients.delete(jobId);
    });
};

const emitToClient = (jobId, event, data) => {
    const client = sseClients.get(jobId);
    if (client) {
        client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
};

const runSync = async (jobId, filePath) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // insert old price column after product price
    worksheet.spliceColumns(PRODUCT_PRICE_COL + 1, 0, []);
    const oldPriceCol = PRODUCT_PRICE_COL + 1;
    const QUANTITY_COL = 30; // was AC(29), shifts to AD(30) after splice

    // collect rows and build url -> rows map
    const urlRowMap = new Map();

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        let productLink = row.getCell(PRODUCT_LINK_COL).value;
        const oldPrice = row.getCell(PRODUCT_PRICE_COL).value;

        if (productLink && typeof productLink === 'object') {
            productLink = productLink.hyperlink || productLink.text ||
                (productLink.richText && productLink.richText.map(t => t.text).join('')) || '';
        }

        if (!productLink) return;

        const url = String(productLink).split('?')[0];
        if (!urlRowMap.has(url)) urlRowMap.set(url, []);
        urlRowMap.get(url).push({ rowNumber, oldPrice });
    });

    const uniqueUrls = Array.from(urlRowMap.keys());
    const total = uniqueUrls.length;

    updateJob(jobId, { status: 'running', total, message: `Found ${total} unique URLs to scrape` });
    emitToClient(jobId, 'progress', getJob(jobId));

    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

    let processed = 0;
    let changed = 0;
    let failed = 0;
    let creditsUsed = 0;
    const changedRows = [];

    for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
        const batch = uniqueUrls.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
            batch.map(async (url) => {
                const products = await scrapeProductAll(url);
                return { url, products };
            })
        );

        for (const { url, products } of results) {
            const affectedRows = urlRowMap.get(url) || [];
            processed++;
            creditsUsed++;

            if (!products || products.length === 0) {
                failed++;
                continue;
            }

            const upcMap = new Map();
            products.forEach(p => upcMap.set(String(p.upc), p));

            for (const { rowNumber, oldPrice } of affectedRows) {
                const row = worksheet.getRow(rowNumber);
                const upc = String(row.getCell(8).value || '').replace(/^UPC/i, '');
                const product = upcMap.get(upc) || products[0];
                if (!upcMap.has(upc)) {
                    console.log(`UPC not found: ${upc} for url: ${url}`);
                }

                const newPrice = product.price;
                const newQty = product.quantity;
                const oldPriceNum = Number(oldPrice);
                const oldQty = Number(row.getCell(QUANTITY_COL).value || 0);
                const sku = row.getCell(1).value || '';

                row.getCell(oldPriceCol).value = oldPriceNum;
                row.getCell(PRODUCT_PRICE_COL).value = newPrice;
                row.getCell(QUANTITY_COL).value = newQty;

                if (newPrice !== oldPriceNum) {
                    changed++;
                    row.getCell(PRODUCT_PRICE_COL).fill = yellowFill;
                    row.getCell(oldPriceCol).fill = yellowFill;
                    changedRows.push({
                        sku,
                        upc,
                        oldPrice: oldPriceNum,
                        newPrice,
                        oldQty,
                        newQty,
                        priceChanged: newPrice !== oldPriceNum,
                        qtyChanged: newQty !== oldQty,
                    });
                }
            }
        }

        const progress = Math.round((processed / total) * 100);
        trackCredits(batch.length);
        updateJob(jobId, {
            progress,
            processed,
            changed,
            failed,
            creditsUsed,
            message: `Processed ${processed}/${total} URLs`,
        });
        emitToClient(jobId, 'progress', getJob(jobId));
    }

    fs.unlinkSync(filePath);

    const outputPath = `uploads/synced_${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(outputPath);

    updateJob(jobId, {
        status: 'done',
        progress: 100,
        changed,
        failed,
        creditsUsed,
        changedRows,
        downloadPath: outputPath,
        message: `Sync complete — ${changed} price changes, ${failed} failed, ${creditsUsed} credits used`,
    });
    emitToClient(jobId, 'done', getJob(jobId));
};

// GET /api/belk/sync/download/:jobId — download completed file
const downloadSync = (req, res) => {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job || job.status !== 'done' || !job.downloadPath) {
        return res.status(404).json({ status: false, msg: 'File not ready or already downloaded' });
    }

    res.download(job.downloadPath, 'synced_products.xlsx', (err) => {
        fs.unlink(job.downloadPath, () => { });
        deleteJob(jobId);
        sseClients.delete(jobId);
        if (err) console.error('Download error:', err);
    });
};

module.exports = { startSync, syncProgress, downloadSync };