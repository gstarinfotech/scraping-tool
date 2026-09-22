'use client';

import { useState } from 'react';
import { omFetch } from '@/utils/om';

const EMPTY_ORDER = {
    'Date ordered': '',
    Retailer: '',
    'Amazon Order id': '',
    'Vendor ID': '',
    Description: '',
    'SKUs to match': '',
    'Vendor Tracking #': '',
    ASINs: '',
    'last date': '',
    Qty: '',
    "Qty Rec'd": '',
    'Date Received': '',
    'Qty Shipped': '',
    Shoes: '',
    'Date Shipped': '',
    Notes: '',
    'Replacement Shoe Box': '',
    'Vendor Return': '',
    'Return date': '',
    pdf: '',
};

export default function AddOrderForm({ employeeId, onSaved, onClose }) {
    const [order, setOrder] = useState(EMPTY_ORDER);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setOrder((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const data = await omFetch('/data/addproduct', {
            method: 'POST',
            body: JSON.stringify({ product: order, id: employeeId, editid: '' }),
        });

        setSaving(false);

        if (data.status === true) {
            setOrder(EMPTY_ORDER);
            onSaved?.(data.data);
        } else {
            setError(data.msg || 'Could not save order');
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-[#12121f] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Add Order</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
                    Close
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(EMPTY_ORDER).map((field) => (
                    <div key={field}>
                        <label className="block text-xs text-gray-400 mb-1">{field}</label>
                        <input
                            type="text"
                            value={order[field]}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full rounded-lg bg-[#1c1c2e] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                ))}

                <div className="col-span-full flex justify-end gap-3 mt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition"
                    >
                        {saving ? 'Saving…' : 'Save Order'}
                    </button>
                </div>
            </form>
            <p className="text-xs text-gray-500 mt-3">
                Note: &quot;SKUs to match&quot; must start with RC / BJ / ZL / OM — this decides which account the order belongs to.
            </p>
        </div>
    );
}
