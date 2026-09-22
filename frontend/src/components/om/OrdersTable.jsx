'use client';

import { useState } from 'react';
import { omFetch } from '@/utils/om';

const COLUMNS = [
    'Amazon Order id',
    'SKUs to match',
    'ASINs',
    'Retailer',
    'Vendor Tracking #',
    'Qty',
    'status',
    'pdf',
];

export default function OrdersTable({ rows, loading, error, editableTracking, onChanged }) {
    const [editingId, setEditingId] = useState(null);
    const [trackingValue, setTrackingValue] = useState('');
    const [busyId, setBusyId] = useState(null);

    const saveTracking = async (id) => {
        setBusyId(id);
        const data = await omFetch('/data/updatetrackingid', {
            method: 'PUT',
            body: JSON.stringify({ id, trackingid: trackingValue }),
        });
        setBusyId(null);
        if (data.status) {
            setEditingId(null);
            onChanged?.();
        }
    };

    const deleteRow = async (id) => {
        if (!confirm('Delete this entry?')) return;
        setBusyId(id);
        const data = await omFetch('/data/deleteentry', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        setBusyId(null);
        if (data.status) onChanged?.();
    };

    if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
    if (error) return <p className="text-red-400 text-sm">{error}</p>;
    if (!rows || rows.length === 0) return <p className="text-gray-500 text-sm">No entries found.</p>;

    return (
        <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr className="bg-[#1c1c2e] text-gray-400 uppercase tracking-wide">
                        {COLUMNS.map((c) => (
                            <th key={c} className="px-3 py-2 border border-white/5 whitespace-nowrap">
                                {c}
                            </th>
                        ))}
                        <th className="px-3 py-2 border border-white/5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r._id} className="hover:bg-white/5 text-gray-200">
                            {COLUMNS.map((c) => (
                                <td key={c} className="px-3 py-2 border border-white/5 whitespace-nowrap">
                                    {c === 'Vendor Tracking #' && editableTracking && editingId === r._id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                value={trackingValue}
                                                onChange={(e) => setTrackingValue(e.target.value)}
                                                className="bg-[#1c1c2e] border border-white/10 rounded px-2 py-1 text-xs w-28"
                                            />
                                            <button
                                                onClick={() => saveTracking(r._id)}
                                                disabled={busyId === r._id}
                                                className="text-green-400 text-xs"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        r[c] || '—'
                                    )}
                                </td>
                            ))}
                            <td className="px-3 py-2 border border-white/5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    {editableTracking && editingId !== r._id && (
                                        <button
                                            onClick={() => {
                                                setEditingId(r._id);
                                                setTrackingValue(r['Vendor Tracking #'] || '');
                                            }}
                                            className="text-blue-400 text-xs"
                                        >
                                            Add tracking id
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteRow(r._id)}
                                        disabled={busyId === r._id}
                                        className="text-red-400 text-xs"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
