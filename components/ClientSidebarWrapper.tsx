"use client";

import React, { useState, useEffect } from 'react';
import ProductFilterSidebar from '@/components/ProductFilterSidebar';

interface Props {
    categories: any[];
}

const ClientSidebarWrapper: React.FC<Props> = ({ categories }) => {
    const [showMobile, setShowMobile] = useState(false);

    useEffect(() => {
        const handler = () => setShowMobile(true);
        window.addEventListener('open-filter-sidebar', handler);
        return () => window.removeEventListener('open-filter-sidebar', handler);
    }, []);

    return (
        // `contents` on mobile = zero layout footprint (no gap in flex column)
        // `block` on desktop = normal sidebar column
        <div className="contents lg:block lg:w-[280px] lg:flex-shrink-0">
            <ProductFilterSidebar
                categories={categories}
                showMobile={showMobile}
                onCloseMobile={() => setShowMobile(false)}
            />
        </div>
    );
};

export default ClientSidebarWrapper;
