"use client";

import React from 'react';
import { Filter } from 'lucide-react';
import { useUI } from '@/context/UIContext';

// This button is placed beside the category title on mobile.
// It opens the filter sidebar drawer via the shared UIContext / 
// a direct state callback passed from ClientSidebarWrapper.
// We use a simple custom event so both components stay decoupled.

interface Props {
    categories: any[];
}

const ClientFilterButton: React.FC<Props> = () => {
    const handleClick = () => {
        // Dispatch a custom event that ClientSidebarWrapper listens to
        window.dispatchEvent(new CustomEvent('open-filter-sidebar'));
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition"
        >
            <Filter size={15} />
            <span>Filters</span>
        </button>
    );
};

export default ClientFilterButton;
