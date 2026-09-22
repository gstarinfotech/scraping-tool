import { useState, useMemo } from 'react';
import { parseAmazonExcel } from '../utils/parseAmazonExcel';
import { matchAndDownload } from '../utils/matchAndDownload';

const PAGE_SIZE = 20;

export default function StepFour({ products }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [matchedRows, setMatchedRows] = useState([]);
    const [page, setPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setResult(null);
        setMatchedRows([]);
        setPage(1);

        try {
            const amazonData = await parseAmazonExcel(file);

            if (amazonData.length === 0) {
                alert('No valid rows found in the Amazon Excel file');
                setLoading(false);
                return;
            }

            const belkMap = new Map();
            products.forEach((p) => belkMap.set(String(p.upc), p));

            const rows = [];
            for (const r of amazonData) {
                if (!r || !r.upc) continue;
                const product = belkMap.get(String(r.upc));
                if (product) {
                    rows.push({
                        upc: r.upc,
                        asin: r.ASIN,
                        title: r.Title,
                        belkLink: product.url,
                        amazonLink: `https://www.amazon.com/dp/${r.ASIN}`,
                    });
                }
            }

            const { count } = matchAndDownload(products, amazonData);

            if (count === 0) {
                alert('No matching products found by UPC');
            } else {
                setResult({ amazonCount: amazonData.length, matchedCount: count });
                setMatchedRows(rows);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to parse Amazon Excel file: ' + err.message);
        }

        setLoading(false);
        e.target.value = '';
    };

    const openBoth = (belkLink, amazonLink) => {
        console.log('Opening:', belkLink, amazonLink);
        const win1 = window.open(belkLink, '_blank');
        console.log('win1:', win1);
        const win2 = window.open(amazonLink, '_blank');
        console.log('win2:', win2);
        if (!win1 || !win2) {
            alert('Popup blocked! Please allow popups for this site in your browser settings, then try again.');
        }
    };

    const filteredRows = useMemo(() => {
        if (!searchKey.trim()) return matchedRows;
        const key = searchKey.toLowerCase();
        return matchedRows.filter(
            (r) => String(r.upc).toLowerCase().includes(key) || String(r.title).toLowerCase().includes(key)
        );
    }, [matchedRows, searchKey]);

    const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
    const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Step 4 — Match with Amazon Excel</h2>
            <p className="text-sm text-gray-500 mb-4">
                Upload the Excel file returned by Amazon to match products by UPC and fill in ASIN + Title.
            </p>

            <label className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition cursor-pointer">
                {loading ? 'Processing...' : 'Upload Amazon Excel'}
                <input
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                />
            </label>

            {result && (
                <p className="mt-4 text-sm text-green-600 font-medium">
                    Matched {result.matchedCount} of {result.amazonCount} Amazon products. Final Excel downloaded.
                </p>
            )}

            {matchedRows.length > 0 && (
                <div className="mt-6">
                    <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-xl px-4 py-3 mb-4">
                        For "Open Both" to open both tabs, allow popups for this site (look for a blocked-popup icon in your browser's address bar after clicking once).
                    </div>

                    <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                        <p className="text-sm text-gray-600 font-medium">
                            Matched products — {matchedRows.length} total
                        </p>
                        <input
                            type="text"
                            value={searchKey}
                            onChange={(e) => { setSearchKey(e.target.value); setPage(1); }}
                            placeholder="Search by UPC or title..."
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                                    <th className="px-3 py-2 border border-gray-100">UPC</th>
                                    <th className="px-3 py-2 border border-gray-100">Title</th>
                                    <th className="px-3 py-2 border border-gray-100">Links</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border border-gray-100">{r.upc}</td>
                                        <td className="px-3 py-2 border border-gray-100 max-w-xs truncate">{r.title}</td>
                                        <td className="px-3 py-2 border border-gray-100">
                                            <button
                                                onClick={() => openBoth(r.belkLink, r.amazonLink)}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                Open Both
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-xs">
                        <p className="text-gray-400">
                            Showing {filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
                                >
                                    Prev
                                </button>
                                {getPageNumbers().map((p, i) =>
                                    p === '...' ? (
                                        <span key={i} className="px-2 text-gray-300">...</span>
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() => setPage(p)}
                                            className={`w-7 h-7 rounded-lg ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}