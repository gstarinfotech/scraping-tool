'use client';

import StepOne from '@/components/stepOne';
import StepTwo from '@/components/stepTwo';
import StepThree from '@/components/stepThree';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'walmart_scraper_session';

export default function WalmartPage() {
    const [urls, setUrls] = useState([]);
    const [products, setProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.urls) setUrls(parsed.urls);
                if (parsed.products) setProducts(parsed.products);
                if (parsed.step) setStep(parsed.step);
            }
        } catch (err) {
            console.error('Failed to restore session:', err);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ urls, products, step }));
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    }, [urls, products, step, hydrated]);

    const handleUrlsExtracted = (extractedUrls) => {
        setUrls(extractedUrls);
        setProducts([]);
        setStep(2);
    };

    const handleProductsScraped = (scrapedProducts) => {
        setProducts(scrapedProducts);
        setStep(3);
    };

    const handleReset = () => {
        if (confirm('Clear current session and start over?')) {
            localStorage.removeItem(STORAGE_KEY);
            setUrls([]);
            setProducts([]);
            setStep(1);
        }
    };

    if (!hydrated) return null;

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Walmart Scraper</h1>
                        <p className="text-sm text-gray-500 mt-1">Extract product data from Walmart category pages and download as Excel.</p>
                    </div>
                    {(urls.length > 0 || products.length > 0) && (
                        <button
                            onClick={handleReset}
                            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition"
                        >
                            Reset Session
                        </button>
                    )}
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs
                                ${step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > s ? '✓' : s}
                            </div>
                            <span className={step >= s ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                                {s === 1 ? 'Extract URLs' : s === 2 ? 'Scrape' : 'Download'}
                            </span>
                            {s < 3 && <span className="text-gray-300 mx-1">—</span>}
                        </div>
                    ))}
                </div>

                {/* Steps */}
                <StepOne onUrlsExtracted={handleUrlsExtracted} apiBase="/api/walmart" />

                {step >= 2 && (
                    <StepTwo urls={urls} onProductsScraped={handleProductsScraped} apiBase="/api/walmart" />
                )}

                {step >= 3 && (
                    <StepThree products={products} />
                )}

            </div>
        </main>
    );
}