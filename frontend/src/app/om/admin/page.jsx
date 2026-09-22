'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, logoutAdmin } from '@/utils/om';

export default function OmAdminPage() {
    const router = useRouter();

    useEffect(() => {
        if (!getAdminToken()) router.push('/om/login');
    }, [router]);

    return (
        <main className="min-h-screen bg-[#0d0d17] px-6 py-10 text-white">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
                <p className="text-gray-400 text-sm mb-6">
                    Login is working. The full admin dashboard (all-employees view, employee management, admin card
                    details) is being built next.
                </p>
                <button
                    onClick={() => {
                        logoutAdmin();
                        router.push('/om/login');
                    }}
                    className="text-xs text-gray-400 hover:text-red-400 border border-white/10 rounded-lg px-3 py-1.5"
                >
                    Log out
                </button>
            </div>
        </main>
    );
}
