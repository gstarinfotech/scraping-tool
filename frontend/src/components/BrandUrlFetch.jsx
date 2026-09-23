'use client';

import { useState } from 'react';

export default function BrandUrlFetch({ onUrlsExtracted, apiBase, account }) {
    const [brandUrl, setBrandUrl] = useState('');
    const [numProducts, setNumProducts] = useState('');
    const [brandName, setBrandName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!brandUrl.trim()) return;

        if (!account) {
            setError('Could not detect your account from your login session. Please log in again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API}${apiBase}/fetchbrand`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: brandUrl.trim(),
                    num: Number(numProducts) || 0,
                    brandname: brandName.trim(),
                    account,
                }),
            });
            const data = await res.json();

            if (data.status) {
                onUrlsExtracted(data.url);
            } else {
                setError(data.msg || 'Could not fetch URLs');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">By Brand URL — Auto Fetch</h2>
            <p className="text-sm text-gray-500 mb-4">
                Give a Belk category page URL and how many products it has — every product URL (across pages) gets
                fetched automatically.
            </p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Account</label>
                        <input
                            value={account}
                            disabled
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-gray-100 text-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Brand Name</label>
                        <input
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g. Nike"
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Brand URL</label>
                    <input
                        value={brandUrl}
                        onChange={(e) => setBrandUrl(e.target.value)}
                        placeholder="https://www.belk.com/c/..."
                        required
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Number of products</label>
                    <input
                        type="number"
                        value={numProducts}
                        onChange={(e) => setNumProducts(e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Over 60 → auto-crawls extra pages (Belk shows 60 products per page).
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="self-start bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                >
                    {loading ? 'Fetching… this can take a while' : 'Fetch URLs'}
                </button>
            </form>
        </div>
    );
}