"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitorTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Let's use a standard fetch to avoid auth token requirements for this public endpoint.
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com/api';

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
