"use client";

import { useEffect, Suspense, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : undefined;
}

function getDeviceType(): string {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent)) {
        return 'Mobile';
    }
    return 'Desktop';
}

function VisitorTrackerInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();
    const lastTrackedUrl = useRef<string | null>(null);

    useEffect(() => {
        // Wait until auth state is initialized
        if (loading) {
            return;
        }

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Prevent double tracking the same URL on identical render cycles
        if (lastTrackedUrl.current === url) {
            return;
        }

        // Do not track admin management pages
        if (pathname.startsWith('/admin')) {
            lastTrackedUrl.current = url;
            return;
        }

        lastTrackedUrl.current = url;

        // Meta / Facebook Attribution Cookies
        const fbp = getCookie('_fbp');
        let fbc = getCookie('_fbc');

        // If fbclid is in the URL and no _fbc cookie yet, format it standardly: fb.1.<timestamp>.<fbclid>
        const fbclid = searchParams?.get('fbclid');
        if (!fbc && fbclid) {
            fbc = `fb.1.${Date.now()}.${fbclid}`;
        }

        // Deterministic Meta PageView event ID
        const fbEventId = `pv_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

        // Device & Environment
        const deviceType = getDeviceType();
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const referrer = typeof document !== 'undefined' ? document.referrer : '';

        // Base API URL
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com/api';
        if (!baseUrl.includes('/api')) {
            baseUrl = `${baseUrl}/api`;
        }
        baseUrl = baseUrl.replace(/\/$/, '');

        fetch(`${baseUrl}/track-visitor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                url,
                fb_event_id: fbEventId,
                fbp: fbp || null,
                fbc: fbc || null,
                device_type: deviceType,
                user_agent: userAgent,
                referrer: referrer || null,
            }),
        }).catch(err => {
            // Silently fail network error without disrupting user
            console.warn('Visitor tracking notice:', err?.message || err);
        });

    }, [pathname, searchParams, loading]);

    return null;
}

export default function VisitorTracker() {
    return (
        <Suspense fallback={null}>
            <VisitorTrackerInner />
        </Suspense>
    );
}
