import { useState } from 'react';

const BATCH_SIZE = 90;

export default function StepTwo({ urls, onProductsScraped, apiBase }) {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const scrapeOne = async (url) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}${apiBase}/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            return { url, success: data.status, products: data.products || [] };
        } catch {
            return { url, success: false, products: [] };
        }
    };

    const handleScrape = async () => {
        setLoading(true);
        setDone(false);

        // initialize all as pending
        setProgress(urls.map(url => ({ url, status: 'pending' })));

        const allProducts = [];

        // split into batches
        for (let i = 0; i < urls.length; i += BATCH_SIZE) {
            const batch = urls.slice(i, i + BATCH_SIZE);

            // mark batch as scraping
            setProgress(prev =>
                prev.map(p => batch.includes(p.url) ? { ...p, status: 'scraping' } : p)
            );

            // run batch in parallel
            const results = await Promise.all(batch.map(url => scrapeOne(url)));

            // update progress and collect products
            results.forEach(({ url, success, products }) => {
                if (success && products.length > 0) {
                    allProducts.push(...products);
                }
                setProgress(prev =>
                    prev.map(p => p.url === url
                        ? { ...p, status: success ? 'success' : 'failed', count: products.length }
                        : p
                    )
                );
            });
        }

        setLoading(false);
        setDone(true);
        onProductsScraped(allProducts);
    };

    const statusColor = (status) => {
        if (status === 'scraping') return 'text-yellow-500';
        if (status === 'success') return 'text-green-500';
        if (status === 'failed') return 'text-red-500';
        return 'text-gray-400';
    };

    const statusLabel = (item) => {
        if (item.status === 'pending') return 'Waiting...';
        if (item.status === 'scraping') return 'Scraping...';
        if (item.status === 'success') return `Done — ${item.count} products`;
        if (item.status === 'failed') return 'Failed';
        return '';
    };

    const successCount = progress.filter(p => p.status === 'success').length;
    const failedCount = progress.filter(p => p.status === 'failed').length;
    const scrapingCount = progress.filter(p => p.status === 'scraping').length;

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Step 2 — Scrape Products</h2>
            <p className="text-sm text-gray-500 mb-4">
                {urls.length} URL{urls.length !== 1 ? 's' : ''} ready to scrape — running {BATCH_SIZE} at a time.
            </p>

            {!loading && !done && (
                <button
                    onClick={handleScrape}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                >
                    Start Scraping
                </button>
            )}

            {/* stats bar */}
            {progress.length > 0 && (
                <div className="flex gap-4 text-xs mb-3 mt-1">
                    <span className="text-yellow-500 font-medium">{scrapingCount} scraping</span>
                    <span className="text-green-500 font-medium">{successCount} done</span>
                    <span className="text-red-500 font-medium">{failedCount} failed</span>
                    <span className="text-gray-400">{progress.filter(p => p.status === 'pending').length} waiting</span>
                </div>
            )}

            {progress.length > 0 && (
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {progress.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2">
                            <span className="text-gray-600 truncate max-w-xs">{item.url}</span>
                            <span className={`font-medium ml-4 shrink-0 ${statusColor(item.status)}`}>
                                {statusLabel(item)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {done && (
                <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm text-green-600 font-medium">
                        Scraping complete! {successCount} succeeded, {failedCount} failed. Proceed to Step 3.
                    </p>
                    {failedCount > 0 && (
                        <button
                            onClick={() => {
                                const failedUrls = progress
                                    .filter(p => p.status === 'failed')
                                    .map(p => p.url)
                                    .join('\n');
                                navigator.clipboard.writeText(failedUrls);
                                alert(`${failedCount} failed URLs copied to clipboard!`);
                            }}
                            className="self-start bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-xl border border-red-200 transition"
                        >
                            Copy {failedCount} Failed URLs
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}