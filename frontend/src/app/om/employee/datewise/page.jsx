'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { omFetch, getEmployeeToken, getSavedEmployee } from '@/utils/om';
import OrdersTable from '@/components/om/OrdersTable';

export default function DatewisePage() {
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (!getEmployeeToken()) router.push('/om/login');
    }, [router]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) return;

        setLoading(true);
        setError('');
        setSearched(true);

        const profile = getSavedEmployee();
        const data = await omFetch('/data/datewise', {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate, account: profile?.account }),
        });

        if (data.status) {
            setRows(data.data || []);
        } else {
            setError(data.msg || 'Failed to load data');
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#0d0d17] px-6 py-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-4">
                <div>
                    <Link href="/om/employee" className="text-blue-400 text-xs">
                        ← Back to dashboard
                    </Link>
                    <h1 className="text-xl font-semibold text-white mt-1">Date-wise Entry</h1>
                </div>

                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Start date</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-lg bg-[#1c1c2e] border border-white/10 px-3 py-2 text-sm text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">End date</label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-lg bg-[#1c1c2e] border border-white/10 px-3 py-2 text-sm text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5"
                    >
                        Search
                    </button>
                </form>

                {searched && (
                    <OrdersTable rows={rows} loading={loading} error={error} editableTracking={false} onChanged={handleSearch} />
                )}
            </div>
        </main>
    );
}
