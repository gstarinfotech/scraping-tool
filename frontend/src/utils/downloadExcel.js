import * as XLSX from 'xlsx';
export const downloadExcel = (products) => {
    const jsondata = products.map((d) => ({
        'UPC': 'UPC' + d.upc,
        'upc2': d.upc,
        'upc3': d.upc,
        'SKU': d.sku,
        'Size': d.size,
        'Color': d.color,
        'Product Price': d.price,
        'Price Range': d.pricerange,
        'Quantity': d.quantity,
        'Belk Link': d.url,
        'Image Link': d.imgurl,
        'ASIN': '',
        'Title': '',
    }));

    // dedupe by UPC
    const deduped = Array.from(
        jsondata.reduce((map, item) => map.set(item['UPC'], item), new Map()).values()
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(deduped);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const sheet = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([sheet], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'belk_products.xlsx';
    link.click();
};