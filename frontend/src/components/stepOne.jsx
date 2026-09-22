export default function StepOne({ onUrlsExtracted, apiBase }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const html = e.target.html.value.trim();
        if (!html) return alert('Please paste HTML first');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API}${apiBase}/extracturls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html }),
        });

        const data = await res.json();
        if (data.status) {
            onUrlsExtracted(data.urls);
        } else {
            alert(data.msg || 'No URLs found');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Step 1 — Paste Category HTML</h2>
            <p className="text-sm text-gray-500 mb-4">Go to a category page, copy the full page HTML and paste it below.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                    name="html"
                    rows={8}
                    placeholder="Paste category page HTML here..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                >
                    Extract URLs
                </button>
            </form>
        </div>
    );
}