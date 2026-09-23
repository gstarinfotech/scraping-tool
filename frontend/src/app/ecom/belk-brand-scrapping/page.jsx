'use client';

import BrandScraperPage from '@/components/BrandScraperPage';

export default function BelkScraperRoute() {
    return <BrandScraperPage vendorLabel="Belk" apiBase="/api/belk" supportsAutoFetch={true} />;
}