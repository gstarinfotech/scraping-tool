'use client';

import BrandScraperPage from '@/components/BrandScraperPage';

export default function WalmartScraperRoute() {
    return <BrandScraperPage vendorLabel="Walmart" apiBase="/api/walmart" supportsAutoFetch={false} />;
}