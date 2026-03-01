"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { Category, getCategoryBar } from '@/lib/api';

const CategoryBar: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await getCategoryBar();

            setCategories(data);
            setLoading(false);
        };
        fetchCategories();
    }, []);

    if (loading || categories.length === 0) return null;

    return (
        <div className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide py-2 shadow-sm">
            <div className="container mx-auto px-4 flex items-center gap-6 whitespace-nowrap">
                {categories.map((cat) => {
                    // Try to get icon from Lucide
                    const IconComponent = (cat.bar_icon && (LucideIcons as any)[cat.bar_icon])
                        ? (LucideIcons as any)[cat.bar_icon]
                        : null;

                    const iconUrl = cat.custom_icon_url;

                    return (
                        <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug || cat.id}`}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors group px-1"
                        >
                            {iconUrl ? (
                                <img src={iconUrl} alt={cat.name} className="w-5 h-5 object-contain" />
                            ) : (
                                IconComponent && (
                                    <IconComponent size={18} className="text-gray-400 group-hover:text-primary" />
                                )
                            )}
                            {cat.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBar;
