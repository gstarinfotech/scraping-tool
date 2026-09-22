import { downloadExcel } from '../utils/downloadExcel';

export default function StepThree({ products }) {
    const handleDownload = () => {
        if (!products || products.length === 0) return alert('No products to download');
        downloadExcel(products);
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Step 3 — Download Excel</h2>
            <p className="text-sm text-gray-500 mb-4">
                {products?.length > 0
                    ? `${products.length} product${products.length !== 1 ? 's' : ''} ready to download.`
                    : 'No products scraped yet.'}
            </p>

            <button
                onClick={handleDownload}
                disabled={!products || products.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
                Download Excel
            </button>

            {products?.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                                <th className="px-3 py-2 border border-gray-100">UPC</th>
                                <th className="px-3 py-2 border border-gray-100">SKU</th>
                                <th className="px-3 py-2 border border-gray-100">Color</th>
                                <th className="px-3 py-2 border border-gray-100">Size</th>
                                <th className="px-3 py-2 border border-gray-100">Price</th>
                                <th className="px-3 py-2 border border-gray-100">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.slice(0, 20).map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 border border-gray-100">{p.upc}</td>
                                    <td className="px-3 py-2 border border-gray-100">{p.sku}</td>
                                    <td className="px-3 py-2 border border-gray-100">{p.color}</td>
                                    <td className="px-3 py-2 border border-gray-100">{p.size}</td>
                                    <td className="px-3 py-2 border border-gray-100">${p.price}</td>
                                    <td className="px-3 py-2 border border-gray-100">{p.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length > 20 && (
                        <p className="text-xs text-gray-400 mt-2">Showing first 20 of {products.length} products.</p>
                    )}
                </div>
            )}
        </div>
    );
}