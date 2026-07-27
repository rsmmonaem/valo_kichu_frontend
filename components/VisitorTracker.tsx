"use client";

import { useEffect, Suspense, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function VisitorTrackerInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const lastTrackedUrl = useRef<string | null>(null);

    useEffect(() => {
        // Wait until we know for sure if the user is logged in
        if (loading) {
            return;
        }

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Prevent double tracking the same URL if dependencies change
        if (lastTrackedUrl.current === url) {
            return;
        }

        const excludedRoles = ['admin', 'super_admin', 'dropshipper', 'sub_dropshipper', 'sub_sub_dropshipper'];
        
        // Do not track admin pages or internal users
        if (pathname.startsWith('/admin') || (user?.role && excludedRoles.includes(user.role))) {
            lastTrackedUrl.current = url;
            return;
        }

        lastTrackedUrl.current = url;

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
