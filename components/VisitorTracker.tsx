"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function VisitorTrackerInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Get the base API URL (e.g. https://backend.valokichu.com/api)
        // If NEXT_PUBLIC_API_URL is just the domain, append /api
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com/api';
        if (!baseUrl.includes('/api')) {
            baseUrl = `${baseUrl}/api`;
        }
        // Remove trailing slash if exists
        baseUrl = baseUrl.replace(/\/$/, '');

        fetch(`${baseUrl}/track-visitor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        }).catch(err => console.error('Visitor tracking failed:', err));

    }, [pathname, searchParams]);

    return null;
}

export default function VisitorTracker() {
    return (
        <Suspense fallback={null}>
            <VisitorTrackerInner />
        </Suspense>
    );
}
