"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BlogCategory } from '@/lib/api';

interface BlogCategoryTabsProps {
    categories: BlogCategory[];
}

const BlogCategoryTabs: React.FC<BlogCategoryTabsProps> = ({ categories }) => {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category') || '';

    if (categories.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Link
                href="/blogs"
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${!activeCategory
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
            >
                All Posts
            </Link>
            {categories.map(cat => (
                <Link
                    key={cat.id}
                    href={`/blogs?category=${cat.slug}`}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.slug
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                >
                    {cat.name}
                </Link>
            ))}
        </div>
    );
};

export default BlogCategoryTabs;
