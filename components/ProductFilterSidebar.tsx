"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Filter, X } from 'lucide-react';
import { Category } from '@/lib/api';

interface ProductFilterSidebarProps {
    categories: Category[];
    showMobile: boolean;
    onCloseMobile: () => void;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({ categories, showMobile, onCloseMobile }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for filters
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const selectedCategory = searchParams.get('category');

    // Update local state when URL changes
    useEffect(() => {
        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
    }, [searchParams]);

    const handlePriceApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('min_price', minPrice);
        else params.delete('min_price');

        if (maxPrice) params.set('max_price', maxPrice);
        else params.delete('max_price');

        // Reset page on filter change
        params.delete('page');

        router.push(`/products?${params.toString()}`);
        if (window.innerWidth < 1024) onCloseMobile();
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        // Only clear price filters, keep category if active
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        const destination = params.toString() ? `/products?${params.toString()}` : '/products';
        router.push(destination);
        if (window.innerWidth < 1024) onCloseMobile();
    };

    const isCategoryActive = (slug: string) => {
        return selectedCategory === slug;
    };

    // Helper to render recursively if needed, but for sidebar usually 1-level or 2-level is fine
    // Let's stick to flat or 1 level nesting for simplicity in sidebar first

    return (
        <>
            {/* Mobile Overlay */}
            {showMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:w-full lg:block border-r border-gray-100 lg:border-none p-5 lg:p-0 overflow-y-auto ${showMobile ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                    <button onClick={onCloseMobile} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
                    <div className="space-y-2">
                        <Link
                            href={(() => {
                                const p = new URLSearchParams();
                                if (minPrice) p.set('min_price', minPrice);
                                if (maxPrice) p.set('max_price', maxPrice);
                                return p.toString() ? `/products?${p.toString()}` : '/products';
                            })()}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${!selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Categories
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={(() => {
                                    const p = new URLSearchParams();
                                    p.set('category', cat.slug || cat.id.toString());
                                    if (minPrice) p.set('min_price', minPrice);
                                    if (maxPrice) p.set('max_price', maxPrice);
                                    return `/products?${p.toString()}`;
                                })()}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${isCategoryActive(cat.slug) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {cat.name}
                                {/* {cat.subcategories && cat.subcategories.length > 0 && <ChevronDown size={14} />} */}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-8 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handlePriceApply}
                            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                        >
                            Apply Price
                        </button>
                    </div>
                </div>

                {/* Clear Filters (if any active) */}
                {(selectedCategory || minPrice || maxPrice) && (
                    <div className="border-t border-gray-100 pt-6">
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            <X size={16} /> Clear All Filters
                        </button>
                    </div>
                )}

            </aside>
        </>
    );
};

export default ProductFilterSidebar;
