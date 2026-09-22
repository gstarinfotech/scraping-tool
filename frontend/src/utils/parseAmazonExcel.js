import * as XLSX from 'xlsx';

export const parseAmazonExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[4];
                if (!sheetName) {
                    return reject(new Error('Expected sheet (index 4) not found in file'));
                }

                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const sliced = rows.slice(6);

                const result = sliced
                    .map((row) => ({
                        upc: row[0],
                        ASIN: row[5],
                        Title: row[2],
                    }))
                    .filter((r) => r.ASIN && String(r.ASIN).trim() !== '' && r.upc);

                resolve(result);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};