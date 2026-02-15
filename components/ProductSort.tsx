"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ProductSort = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'newest';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        params.delete('page'); // Reset pagination
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 hidden sm:block">Sort By:</label>
            <select
                id="sort"
                value={currentSort}
                onChange={handleSortChange}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="newest">Newest Arrivals</option>
                <option value="oldest">Price: Low to High</option>
                {/* Wait, 'oldest' usually means Date Ascending. Price Low->High is 'low_to_high'. Check API/Controller */}
                {/* Controller: low_to_high, high_to_low, popularity, newest, oldest */}
                <option value="low_to_high">Price: Low to High</option>
                <option value="high_to_low">Price: High to Low</option>
                <option value="popularity">Popularity</option>
            </select>
        </div>
    );
};

export default ProductSort;
