'use client';

import BrandScraperPage from '@/components/BrandScraperPage';

export default function BoscovScraperRoute() {
    return <BrandScraperPage vendorLabel="Boscovs" apiBase="/api/boscov" supportsAutoFetch={false} />;
}