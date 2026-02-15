"use client";

import React, { useState } from 'react';
import ProductFilterSidebar from '@/components/ProductFilterSidebar';
import { Filter } from 'lucide-react';

interface Props {
    categories: any[];
}

const ClientSidebarWrapper: React.FC<Props> = ({ categories }) => {
    const [showMobile, setShowMobile] = useState(false);

    return (
        <div className="lg:w-[280px] flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowMobile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
                >
                    <Filter size={16} /> Filters
                </button>
            </div>

            <ProductFilterSidebar
                categories={categories}
                showMobile={showMobile}
                onCloseMobile={() => setShowMobile(false)}
            />
        </div>
    );
};

export default ClientSidebarWrapper;
