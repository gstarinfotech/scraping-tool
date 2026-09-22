'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

const SYNC_HEADERS = [
    'sku', 'empty', 'empty1', 'empty2', 'product link', 'empty3', 'empty4',
    'input UPC', 'asin', 'empty5', 'empty6', 'empty7', 'empty8', 'empty9',
    'product price', 'empty10', 'fulfillment', 'empty11', 'empty12', 'empty13',
    'shipping template', 'empty14', 'empty15', 'empty16', 'empty17', 'empty18', 'empty19',
    'amazon fees %', 'quantity'
];

export default function SyncPage() {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [job, setJob] = useState(null);
    const [credits, setCredits] = useState(null);
    const sseRef = useRef(null);

    useEffect(() => {
        fetchCredits();
        return () => {
            if (sseRef.current) sseRef.current.close();
        };
    }, []);

    const fetchCredits = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/belk/credits`);
            const data = await res.json();
            if (data.status) setCredits(data);
        } catch (err) {
            console.error('Credits fetch error:', err);
        }
    };

    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([SYNC_HEADERS]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const sheet = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([sheet], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sync_template.xlsx';
        link.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError('');
        setJob(null);
        setFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/belk/sync`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!data.status) throw new Error(data.msg || 'Failed to start sync');

            const jobId = data.jobId;

            // open SSE connection
            const sse = new EventSource(`${process.env.NEXT_PUBLIC_API}/api/belk/sync/progress/${jobId}`);
            sseRef.current = sse;

            sse.addEventListener('progress', (e) => {
                const jobData = JSON.parse(e.data);
                setJob(jobData);
            });

            sse.addEventListener('done', (e) => {
                const jobData = JSON.parse(e.data);
                setJob(jobData);
                setLoading(false);
                sse.close();
                fetchCredits(); // refresh credits after sync

                // trigger download
                const link = document.createElement('a');
                link.href = `${process.env.NEXT_PUBLIC_API}/api/belk/sync/download/${jobId}`;
                link.click();
            });

            sse.addEventListener('error', (e) => {
                try {
                    const errData = JSON.parse(e.data);
                    setError(errData.msg || 'Sync failed');
                } catch {
                    setError('Sync connection lost');
                }
                setLoading(false);
                sse.close();
            });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong');
            setLoading(false);
        }

        e.target.value = '';
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Price Sync</h1>
                        <p className="text-sm text-gray-500 mt-1">Re-scrape Belk prices and highlight any changes.</p>
                    </div>

                    {/* Credits widget */}
                    {credits && (
                        <div className="bg-white rounded-xl shadow px-4 py-3 text-right">
                            <p className="text-xs text-gray-400">Credits Used This Session</p>
                            <p className="text-lg font-bold text-gray-800">{credits.usedThisSession?.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">≈ ${(credits.usedThisSession * 0.00246).toFixed(4)} estimated cost</p>
                            <a href="https://app.zenrows.com" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View dashboard →</a>
                        </div>
                    )}
                </div>

                {/* Template download */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Download Template</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Get a blank sync file with the correct column layout.
                    </p>
                    <button
                        onClick={downloadTemplate}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl transition"
                    >
                        Download Sync Template
                    </button>
                </div>

                {/* Sync upload */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Upload & Sync</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Upload your filled sync file. The tool will scrape each unique URL once, update prices and quantities, and highlight changes in yellow.
                    </p>

                    <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition cursor-pointer">
                        {loading ? 'Syncing...' : 'Upload Sync File'}
                        <input
                            type="file"
                            accept=".xlsx,.xls,.xlsm"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="hidden"
                        />
                    </label>

                    {fileName && (
                        <p className="text-xs text-gray-400 mt-3">File: {fileName}</p>
                    )}

                    {/* Progress */}
                    {job && (
                        <div className="mt-6 flex flex-col gap-3">
                            {/* Progress bar */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{job.message}</span>
                                <span className="font-semibold">{job.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-3 rounded-full transition-all duration-700 ease-in-out ${
                                        job.status === 'done'
                                            ? 'bg-green-500'
                                            : 'bg-blue-600 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 animate-pulse'
                                    }`}
                                    style={{ width: `${job.progress || 0}%` }}
                                />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400">Processed</p>
                                    <p className="text-lg font-bold text-gray-800">{job.processed || 0}<span className="text-xs text-gray-400">/{job.total || 0}</span></p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400">Price Changes</p>
                                    <p className="text-lg font-bold text-yellow-600">{job.changed || 0}</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400">Failed</p>
                                    <p className="text-lg font-bold text-red-500">{job.failed || 0}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400">Credits Used</p>
                                    <p className="text-lg font-bold text-blue-600">{job.creditsUsed || 0}</p>
                                </div>
                            </div>

                            {job.status === 'done' && (
                                <p className="text-sm text-green-600 font-medium mt-1">
                                    ✓ Sync complete! File downloaded automatically.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Changed rows table */}
                    {job?.status === 'done' && job?.changedRows?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Price Changes — {job.changedRows.length} products updated
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                                            <th className="px-3 py-2 border border-gray-100">SKU</th>
                                            <th className="px-3 py-2 border border-gray-100">UPC</th>
                                            <th className="px-3 py-2 border border-gray-100 text-center" colSpan={2}>Price</th>
                                            <th className="px-3 py-2 border border-gray-100 text-center" colSpan={2}>Quantity</th>
                                        </tr>
                                        <tr className="bg-gray-50 text-gray-400 text-xs">
                                            <th className="px-3 py-1 border border-gray-100"></th>
                                            <th className="px-3 py-1 border border-gray-100"></th>
                                            <th className="px-3 py-1 border border-gray-100 text-orange-400">Old</th>
                                            <th className="px-3 py-1 border border-gray-100 text-green-500">New</th>
                                            <th className="px-3 py-1 border border-gray-100 text-orange-400">Old</th>
                                            <th className="px-3 py-1 border border-gray-100 text-green-500">New</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {job.changedRows.map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 border border-gray-100 font-mono text-xs">{r.sku}</td>
                                                <td className="px-3 py-2 border border-gray-100">{r.upc}</td>
                                                <td className="px-3 py-2 border border-gray-100 text-orange-500">${r.oldPrice}</td>
                                                <td className={`px-3 py-2 border border-gray-100 font-semibold ${r.newPrice > r.oldPrice ? 'text-red-500' : 'text-green-600'}`}>
                                                    ${r.newPrice}
                                                    <span className="ml-1 text-xs font-normal">
                                                        {r.newPrice > r.oldPrice ? '↑' : '↓'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 border border-gray-100 text-orange-500">{r.oldQty}</td>
                                                <td className={`px-3 py-2 border border-gray-100 font-semibold ${r.newQty < r.oldQty ? 'text-red-500' : 'text-green-600'}`}>
                                                    {r.newQty}
                                                    <span className="ml-1 text-xs font-normal">
                                                        {r.newQty !== r.oldQty ? (r.newQty > r.oldQty ? '↑' : '↓') : ''}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>

            </div>
        </main>
    );
}