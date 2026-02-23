"use client";

import { useEffect } from 'react';

export default function StoreInitializer({ username }: { username: string }) {
    useEffect(() => {
        if (username) {
            localStorage.setItem('referral_code', username);
            document.cookie = `referral_code=${username}; path=/; max-age=${60 * 60 * 24 * 30}`;

            // Dispatch storage event for other components (like Header) to update
            window.dispatchEvent(new Event('storage'));
        }
    }, [username]);

    return null;
}
