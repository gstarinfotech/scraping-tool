'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    OM_API,
    getEmployeeToken,
    setEmployeeSession,
    logoutEmployee,
    getSavedEmployee,
} from '@/utils/om';
import AddOrderForm from '@/components/om/AddOrderForm';

const NAV = [
    { key: 'untrackable', label: 'Untrackable' },
    { key: 'pdfrequire', label: 'PDF Require' },
    { key: 'unshipped', label: 'Unshipped' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'return', label: 'Return' },
    { key: 'todayentry', label: "Today's Entry" },
];

const BRAND_ROUTES = [
    {
        label: 'Belk',
        href: '/ecom/belk-brand-scrapping',
    },
    {
        label: 'Boscovs',
        href: '/ecom/boscovs-brand-scrapping',
    },
    {
        label: 'Golf Apparel',
        href: '/ecom/golf-brand-scrapping',
    },
    {
        label: 'Bloomingdale',
        href: '/ecom/bloomingdale-brand-scrapping',
    },
    {
        label: 'Walmart',
        href: '/ecom/walmart-brand-scrapping',
    },
    {
        label: 'Macy',
        href: '/ecom/macy-brand-scrapping',
    },
    {
        label: 'Academy',
        href: '/ecom/academy-brand-scrapping',
    },
    {
        label: 'Jcpenny',
        href: '/ecom/jcpenny-brand-scrapping',
    },
];

export default function OmEmployeeDashboard() {
    const router = useRouter();

    const [profile, setProfile] = useState(null);
    const [showAddOrder, setShowAddOrder] = useState(false);
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);

    const [searchKey, setSearchKey] = useState('');
    const [searchBy, setSearchBy] = useState('Amazon Order id');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const loadProfile = useCallback(async () => {
        const token = getEmployeeToken();

        if (!token) {
            router.push('/om/login');
            return;
        }

        try {
            const res = await fetch(`${OM_API}/employee/getprofile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.status) {
                setProfile(data.employee);
                setEmployeeSession(token, data.employee);
            } else {
                logoutEmployee();
                router.push('/om/login');
            }
        } catch (err) {
            console.error(err);
        }
    }, [router]);

    useEffect(() => {
        const saved = getSavedEmployee();

        if (saved) {
            setProfile(saved);
        }

        loadProfile();
    }, [loadProfile]);

    const handleLogout = () => {
        logoutEmployee();
        router.push('/om/login');
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchKey.trim()) return;

        setSearching(true);

        try {
            const res = await fetch(`${OM_API}/data/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: searchKey,
                    searchby: searchBy,
                }),
            });

            const data = await res.json();

            setSearchResults(data.status ? data.data : []);
        } catch (err) {
            console.error(err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-[#222222] text-white">
            <div className="w-full">

                <div className="w-full bg-black border-b border-gray-600">
                    <div className="w-full px-8 py-5 flex items-center justify-between">

                        <div className="flex items-center gap-5">
                            <div className="text-[28px] font-bold tracking-tight whitespace-nowrap">
                                Gstar Tool - Order Management
                            </div>
                        </div>

                        <div className="flex items-center gap-7">
                            <Link
                                href="#"
                                className="text-white font-semibold text-[16px] hover:text-gray-300 whitespace-nowrap"
                            >
                                Follow up
                            </Link>

                            <Link
                                href="#"
                                className="text-white font-semibold text-[16px] hover:text-gray-300 whitespace-nowrap"
                            >
                                Label Generation
                            </Link>

                            <div className="h-12 w-px bg-gray-600 mx-1" />

                            <div className="text-white leading-6 text-[16px] whitespace-nowrap">
                                <div>
                                    Hello, {profile?.name || 'User'}
                                </div>
                                <div>
                                    Account : {profile?.account || ''}
                                </div>
                            </div>

                            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-sm">
                                ●
                            </div>

                            <button
                                onClick={handleLogout}
                                className="text-white font-semibold text-[16px] hover:text-gray-300 whitespace-nowrap -ml-4"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full px-7 pt-3">
                    <div className="w-full border-b border-gray-500 pb-2">

                        <div className="w-full flex items-center gap-6">

                            <div className="flex items-center gap-7 flex-1 min-w-0">
                                {NAV.map((n) => (
                                    <Link
                                        key={n.key}
                                        href={`/om/employee/${n.key}`}
                                        className="text-white font-[500] text-[16px] py-3 hover:text-gray-300 whitespace-nowrap"
                                    >
                                        {n.label}
                                    </Link>
                                ))}

                                <Link
                                    href="/om/employee/datewise"
                                    className="text-white font-[500] text-[1p6x] py-3 hover:text-gray-300 whitespace-nowrap"
                                >
                                    Date-wise Entry
                                </Link>
                            </div>

                            <form
                                onSubmit={handleSearch}
                                className="flex items-center gap-2 shrink-0"
                            >
                                <select
                                    value={searchBy}
                                    onChange={(e) =>
                                        setSearchBy(e.target.value)
                                    }
                                    className="h-12 w-[220px] bg-[#222222] border border-green-700 rounded-lg px-4 text-white text-base outline-none"
                                >
                                    <option>Amazon Order id</option>
                                    <option>ASINs</option>
                                    <option>Vendor ID</option>
                                    <option>SKUs to match</option>
                                    <option>Vendor Tracking</option>
                                </select>

                                <input
                                    value={searchKey}
                                    onChange={(e) =>
                                        setSearchKey(e.target.value)
                                    }
                                    placeholder="Search in database"
                                    className="h-12 w-[310px] bg-[#222222] border border-gray-400 rounded-lg px-4 text-white text-base outline-none placeholder:text-gray-400"
                                />

                                <button
                                    type="submit"
                                    className="h-12 w-14 border border-gray-500 rounded-lg text-2xl hover:bg-gray-700"
                                >
                                    {searching ? '…' : '⌕'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchResults(null);
                                        setSearchKey('');
                                    }}
                                    className="h-12 w-14 border border-gray-500 rounded-lg text-3xl hover:bg-gray-700"
                                >
                                    ×
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="w-full px-10 pt-6">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() =>
                                setShowAddOrder((value) => !value)
                            }
                            className="rounded-full border-2 border-white bg-[#003b9b] hover:bg-[#004fc7] text-white text-lg font-semibold px-8 py-2"
                        >
                            {showAddOrder
                                ? 'Hide Add Order'
                                : '+  Add Order'}
                        </button>

                        <Link
                            href="/ecom/inventory-update"
                            className="rounded-full border-2 border-white bg-[#003b9b] hover:bg-[#004fc7] text-white text-lg font-semibold px-8 py-2"
                        >
                            ⟳ &nbsp; Sync Product
                        </Link>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowBrandDropdown((value) => !value)
                                }
                                className="rounded-full border-2 border-white bg-[#222222] hover:bg-[#333333] text-white text-md font-semibold px-8 py-2 flex items-center gap-3"
                            >
                                <span className="text-3xl leading-none">
                                    a
                                </span>

                                <span>Brand Scrapping</span>

                                <span className="text-sm">
                                    {showBrandDropdown ? '▲' : '▼'}
                                </span>
                            </button>

                            {showBrandDropdown && (
                                <div className="absolute left-3 top-full mt-1 z-50 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden">
                                    {BRAND_ROUTES.map((brand) => (
                                        <Link
                                            key={brand.href}
                                            href={brand.href}
                                            onClick={() =>
                                                setShowBrandDropdown(false)
                                            }
                                            className="block px-5 py-3 text-lg hover:bg-gray-200"
                                        >
                                            {brand.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/extract-sku"
                            className="rounded-full border-2 border-white bg-[#003b9b] hover:bg-[#004fc7] text-white text-lg font-semibold px-8 py-2"
                        >
                            ▤ &nbsp; Extract SKU
                        </Link>

                        <Link
                            href="/google-sheet"
                            className="text-white text-lg font-semibold flex items-center gap-3 hover:text-gray-300"
                        >
                            <span className="text-3xl">
                                ▦
                            </span>
                            Upload Center
                        </Link>
                    </div>

                    {showAddOrder && (
                        <div className="mt-6">
                            <AddOrderForm
                                employeeId={profile?._id}
                                onClose={() =>
                                    setShowAddOrder(false)
                                }
                                onSaved={() =>
                                    setShowAddOrder(false)
                                }
                            />
                        </div>
                    )}

                    {searchResults !== null && (
                        <div className="mt-8 rounded-xl border border-gray-600 bg-[#292929] p-5">
                            <h2 className="text-white text-lg font-semibold mb-4">
                                Search results ({searchResults.length})
                            </h2>

                            {searchResults.length === 0 ? (
                                <p className="text-gray-400">
                                    No matching orders.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <tbody>
                                            {searchResults.map((r) => (
                                                <tr
                                                    key={r._id}
                                                    className="text-gray-200 border-b border-gray-700"
                                                >
                                                    <td className="px-3 py-3">
                                                        {r['ASINs']}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {r['SKUs to match']}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {r['Vendor ID']}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {r['Vendor Tracking'] || '—'}
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        {r.status || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}