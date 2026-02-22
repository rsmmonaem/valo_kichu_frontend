"use client";

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
    onIntersect: () => void;
    isLoading: boolean;
    hasMore: boolean;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
    onIntersect,
    isLoading,
    hasMore
}) => {
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onIntersect();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (triggerRef.current) {
            observer.observe(triggerRef.current);
        }

        return () => observer.disconnect();
    }, [onIntersect, isLoading, hasMore]);

    if (!hasMore) return null;

    return (
        <div ref={triggerRef} className="py-10 flex justify-center w-full">
            {isLoading && (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading more items...</p>
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollTrigger;
