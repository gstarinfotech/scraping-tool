'use client';

import StepFour from '@/components/stepFour';
import StepOne from '@/components/stepOne';
import BrandUrlFetch from '@/components/BrandUrlFetch';
import StepThree from '@/components/stepThree';
import StepTwo from '@/components/stepTwo';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeToken, getSavedEmployee } from '@/utils/om';

/**
 * One shared flow for every vendor's brand-scraping page (matches the old
 * tool, where Belk/Boscov/Walmart/etc. pages were all the same template).
 *
 * Props:
 *  - vendorLabel: display name, e.g. "Belk"
 *  - apiBase: e.g. "/api/belk"
 *  - supportsAutoFetch: whether this vendor's backend has /fetchbrand wired
 *    up yet (auto-crawl by Brand URL). Vendors without it yet only show
 *    the "By HTML" tab, so we don't show a button that will just fail.
 */
export default function BrandScraperPage({ vendorLabel, apiBase, supportsAutoFetch = false }) {
    const router = useRouter();
    const storageKey = `${vendorLabel.toLowerCase()}_scraper_session`;

    const [profile, setProfile] = useState(null);
    const [urls, setUrls] = useState([]);
    const [products, setProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [hydrated, setHydrated] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [fetchMethod, setFetchMethod] = useState(supportsAutoFetch ? 'url' : 'html');

    // Every brand-scraping page sits behind Order Management login — account
    // comes from that session, same as the old tool.
    useEffect(() => {
        if (!getEmployeeToken()) {
            router.push('/om/login');
            return;
        }
        setProfile(getSavedEmployee());
    }, [router]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify({ urls, products, step }));
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    }, [urls, products, step, hydrated, storageKey]);

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
            localStorage.removeItem(storageKey);
            setUrls([]);
            setProducts([]);
            setStep(1);
        }
    };

    if (!hydrated) return null;

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{vendorLabel} Scraper</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Extract product data from {vendorLabel} category pages and download as Excel.
                        </p>
                        {profile && (
                            <p className="text-xs text-gray-400 mt-1">
                                Hello, {profile.name} · Account: {profile.account}
                            </p>
                        )}
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

                <div className="flex items-center gap-2 text-sm flex-wrap">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${step === s
                                        ? 'bg-blue-600 text-white'
                                        : step > s
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s ? '✓' : s}
                            </div>
                            <span className={step >= s ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                                {s === 1 ? 'Extract URLs' : s === 2 ? 'Scrape' : 'Download'}
                            </span>
                            {s < 3 && <span className="text-gray-300 mx-1">—</span>}
                        </div>
                    ))}

                    <button
                        onClick={() => setIsVisible(true)}
                        style={{
                            color: 'black',
                            marginLeft: '40px',
                            border: '1px solid black',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            fontSize: '15px',
                            backgroundColor: '#a7ebfe',
                            cursor: 'pointer',
                        }}
                    >
                        Match Amazon & Get ASIN
                    </button>
                </div>

                {supportsAutoFetch ? (
                    <>
                        <div className="flex rounded-xl bg-gray-200 p-1 w-fit text-sm">
                            <button
                                type="button"
                                onClick={() => setFetchMethod('url')}
                                className={`px-4 py-1.5 rounded-lg font-medium transition ${fetchMethod === 'url' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                                    }`}
                            >
                                By Brand URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setFetchMethod('html')}
                                className={`px-4 py-1.5 rounded-lg font-medium transition ${fetchMethod === 'html' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                                    }`}
                            >
                                By HTML
                            </button>
                        </div>

                        {fetchMethod === 'url' ? (
                            <BrandUrlFetch onUrlsExtracted={handleUrlsExtracted} apiBase={apiBase} account={profile?.account} />
                        ) : (
                            <StepOne onUrlsExtracted={handleUrlsExtracted} apiBase={apiBase} />
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                            &quot;By Brand URL&quot; auto-fetch isn&apos;t wired up for {vendorLabel} yet — paste HTML for now.
                        </p>
                        <StepOne onUrlsExtracted={handleUrlsExtracted} apiBase={apiBase} />
                    </>
                )}

                {step >= 2 && <StepTwo urls={urls} onProductsScraped={handleProductsScraped} apiBase={apiBase} />}
                {step >= 3 && <StepThree products={products} />}
                {isVisible && <StepFour products={products} />}
            </div>
        </main>
    );
}