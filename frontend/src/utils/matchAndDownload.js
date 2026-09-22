import * as XLSX from 'xlsx';
import { calculateShippingCost } from './calculateShippingCost';

export const matchAndDownload = (belkProducts, amazonData) => {
    // build a lookup map from belk products by upc for fast matching
    const belkMap = new Map();
    belkProducts.forEach((p) => {
        belkMap.set(String(p.upc), p);
    });

    const today = new Date();
    const dateStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

    const finalSheet = [];

    for (const r of amazonData) {
        if (!r || !r.upc) continue;

        const product = belkMap.get(String(r.upc));
        if (product) {
            const shippingCost = calculateShippingCost(r.Title) || 0;
            const sku = product?.sku || '';

            finalSheet.push({
                'date': dateStr,
                'sku': sku,
                'vendor': product?.vendor || 'belk',
                'sku length': sku.length,
                'amazon title': r.Title,
                'belk link': product?.url || '',
                'brand': product?.brand || '',
                'upc': r.upc,
                'UPC': 'UPC' + r.upc,
                'asin': r.ASIN,
                'gap1': '',
                'gap2': '',
                'gap3': '',
                'size': product?.size || '',
                'sku2': sku,
                'product price': product?.price ? Number(Number(product.price).toFixed(1)) : 0,
                'vendor shipping': 0,
                'fulfillment shipping': shippingCost,
            });
        }
    }

    if (finalSheet.length === 0) {
        return { count: 0 };
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(finalSheet);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const sheet = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([sheet], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'final_product_list.xlsx';
    link.click();

    return { count: finalSheet.length };
};