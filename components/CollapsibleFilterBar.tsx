"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown, RefreshCw } from 'lucide-react';
import { Category } from '@/lib/api';

interface CollapsibleFilterBarProps {
    categories: Category[];
    title?: string;
    subtitle?: string;
}

const CollapsibleFilterBar: React.FC<CollapsibleFilterBarProps> = ({ categories, title, subtitle }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Filter states
    const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    // Update state when URL searchParams change
    useEffect(() => {
        setCategorySlug(searchParams.get('category') || '');
        setMinPrice(searchParams.get('min_price') || '');
        setMaxPrice(searchParams.get('max_price') || '');
        setSort(searchParams.get('sort') || 'newest');
    }, [searchParams]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (categorySlug) params.set('category', categorySlug);
        else params.delete('category');

        if (minPrice) params.set('min_price', minPrice);
        else params.delete('min_price');

        if (maxPrice) params.set('max_price', maxPrice);
        else params.delete('max_price');

        if (sort) params.set('sort', sort);
        else params.delete('sort');

        params.delete('page'); // Reset pagination on filter change
        router.push(`/products?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setCategorySlug('');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');

        const params = new URLSearchParams();
        const search = searchParams.get('search');
        if (search) params.set('search', search);

        router.push(params.toString() ? `/products?${params.toString()}` : '/products');
    };

    const hasActiveFilters = categorySlug || minPrice || maxPrice || sort !== 'newest';

    return (
        <div className="w-full">
            {/* Title and Filter Toggle Button Row */}
            <div className="flex items-center justify-between gap-4">
                {title ? (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                        <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight truncate">{title}</h1>
                        {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                ) : <div />}

                <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-red-500 rounded-xl text-xs font-semibold border border-gray-200/50 transition cursor-pointer"
                        >
                            <RefreshCw size={12} />
                            <span className="hidden sm:inline">Reset Filters</span>
                        </button>
                    )}

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 shadow-sm cursor-pointer select-none ${
                            isOpen 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Filter size={16} />
                        <span>Filters</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Collapsible Filter Panel */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
            }`}>
                <div className="bg-gray-50/50 border border-gray-200/70 rounded-2xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-end">
                    
                    {/* Category Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                        <select
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug || cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Range (৳)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                            <span className="text-gray-400 font-medium">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By</label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="low_to_high">Price: Low to High</option>
                            <option value="high_to_low">Price: High to Low</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/10 transition cursor-pointer text-center"
                        >
                            Apply Filters
                        </button>
                        
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:text-red-500 rounded-xl text-gray-500 transition cursor-pointer"
                                title="Clear All Filters"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CollapsibleFilterBar;
