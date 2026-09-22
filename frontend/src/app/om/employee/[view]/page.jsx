'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { omFetch, getEmployeeToken, getSavedEmployee } from '@/utils/om';
import OrdersTable from '@/components/om/OrdersTable';

const VIEWS = {
    untrackable: { title: 'Untrackable', endpoint: '/data/untrackable', editableTracking: true },
    pdfrequire: { title: 'PDF Require', endpoint: '/data/pdfrequire', editableTracking: false },
    unshipped: { title: 'Unshipped', endpoint: '/data/unshipped', editableTracking: false },
    deadline: { title: 'Deadline', endpoint: '/data/deadline', editableTracking: false },
    return: { title: 'Return', endpoint: '/data/returned', editableTracking: false },
    todayentry: { title: "Today's Entry", endpoint: '/data/todayentry', editableTracking: false },
};

export default function OmFilteredViewPage() {
    const { view } = useParams();
    const router = useRouter();
    const config = VIEWS[view];

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!config) return;
        setLoading(true);
        setError('');

        const profile = getSavedEmployee();
        const data = await omFetch(config.endpoint, {
            method: 'POST',
            body: JSON.stringify({ account: profile?.account }),
        });

        if (data.status === true) {
            setRows(data.data || []);
        } else if (data.status === 'notfound') {
            setRows([]);
        } else {
            setError(data.msg || 'Failed to load data');
        }
        setLoading(false);
    }, [config]);

    useEffect(() => {
        if (!getEmployeeToken()) {
            router.push('/om/login');
            return;
        }
        load();
    }, [load, router]);

    if (!config) {
        return (
            <main className="min-h-screen bg-[#0d0d17] px-6 py-10 text-white">
                <p>Unknown view.</p>
                <Link href="/om/employee" className="text-blue-400 text-sm">
                    ← Back to dashboard
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0d0d17] px-6 py-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/om/employee" className="text-blue-400 text-xs">
                            ← Back to dashboard
                        </Link>
                        <h1 className="text-xl font-semibold text-white mt-1">{config.title}</h1>
                    </div>
                    <button
                        onClick={load}
                        className="text-xs text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5"
                    >
                        Refresh
                    </button>
                </div>

                <OrdersTable
                    rows={rows}
                    loading={loading}
                    error={error}
                    editableTracking={config.editableTracking}
                    onChanged={load}
                />
            </div>
        </main>
    );
}
