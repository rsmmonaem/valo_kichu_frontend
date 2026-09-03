"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, X, Menu, Search } from 'lucide-react';
import clsx from 'clsx';
import { Category } from '@/lib/api';

interface MobileCategorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

const MobileCategorySidebar: React.FC<MobileCategorySidebarProps> = ({ isOpen, onClose, categories }) => {
    const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpandedCats(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getImageUrl = (url?: string) => {
        if (!url) return '';
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
        let cleanUrl = url;
        if (!url.startsWith('http')) {
            cleanUrl = `${baseUrl}/storage/${url.replace(/^\/?storage\/?/, '')}`;
        }
        cleanUrl = cleanUrl.replace('/storage/products/', '/storage/categories/');
        if (cleanUrl.includes('/storage/') && !cleanUrl.includes('/storage/categories/')) {
            cleanUrl = cleanUrl.replace('/storage/', '/storage/categories/');
        }
        return cleanUrl;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Menu size={18} className="text-blue-600" />
                        <span className="text-base tracking-wide">Categories</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        aria-label="Close categories menu"
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const val = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                        if (val.trim()) {
                            window.location.href = `/products?search=${encodeURIComponent(val)}`;
                            onClose();
                        }
                    }}>
                        <div className="relative">
                            <input
                                name="search"
                                type="text"
                                placeholder="Search products..."
                                aria-label="Search products"
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition-all"
                            />
                            <button 
                                type="submit" 
                                aria-label="Search"
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600 p-0.5 transition-colors"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-3 py-4 bg-white">
                    <ul className="space-y-2">
                        {/* "All Products" is commented out as requested */}
                        {/* <li className="px-1">
                            <Link
                                href="/products?category=all"
                                className="block py-2.5 px-4 font-bold text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100"
                                onClick={onClose}
                                prefetch={false}
                            >
                                All Products
                            </Link>
                        </li> */}

                        {[...categories]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((cat, index) => (
                                <li key={cat.id} className="list-none px-1">
                                <div className={clsx(
                                    "flex items-center justify-between rounded-xl transition-all duration-200 hover:bg-blue-50/40 active:bg-blue-100/40 group border",
                                    index % 2 === 0 
                                        ? "bg-white border-gray-100 shadow-sm" 
                                        : "bg-gray-100/80 border-gray-200/50 shadow-sm"
                                )}>
                                    <Link
                                        href={`/products?category=${cat.slug || cat.id}`}
                                        className="flex-1 py-2 px-3 text-sm font-semibold text-gray-700 group-hover:text-blue-600 flex items-center gap-3 transition-colors"
                                        onClick={onClose}
                                        prefetch={false}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                            {cat.image_url ? (
                                                <img
                                                    src={getImageUrl(cat.image_url)}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500 font-bold">{cat.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className="text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{cat.name}</span>
                                    </Link>

                                    {cat.subcategories && cat.subcategories.length > 0 && (
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-100/50 rounded-r-xl transition-colors shrink-0"
                                        >
                                            <ChevronDown
                                                size={16}
                                                className={clsx("transition-transform duration-300", expandedCats[cat.id] ? "rotate-180 text-blue-600" : "text-gray-400")}
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Subcategories */}
                                {cat.subcategories && cat.subcategories.length > 0 && (
                                    <div className={clsx(
                                        "overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 rounded-xl mx-2 border border-gray-50/50",
                                        expandedCats[cat.id] ? "max-h-[1000px] my-1.5 py-1" : "max-h-0"
                                    )}>
                                        <ul className="space-y-0.5">
                                            {cat.subcategories.map(sub => (
                                                <li key={sub.id} className="list-none">
                                                    <div className="flex items-center justify-between rounded-lg mx-1 transition-colors hover:bg-gray-100/60">
                                                        <Link
                                                            href={`/products?category=${sub.slug || sub.id}`}
                                                            className="flex-1 block py-2 px-3 pl-8 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                                            onClick={onClose}
                                                            prefetch={false}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.subcategories && sub.subcategories.length > 0 && (
                                                            <button
                                                                onClick={() => toggleExpand(sub.id)}
                                                                className="p-2 pr-3 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                                                            >
                                                                <ChevronDown
                                                                    size={14}
                                                                    className={clsx("transition-transform duration-300", expandedCats[sub.id] ? "rotate-180 text-blue-600" : "text-gray-400")}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Level 3 */}
                                                    {sub.subcategories && sub.subcategories.length > 0 && (
                                                        <div className={clsx(
                                                            "overflow-hidden transition-all duration-300 ease-in-out bg-gray-100/30 mx-3 rounded-lg border border-gray-100/50",
                                                            expandedCats[sub.id] ? "max-h-[500px] my-1 py-1" : "max-h-0"
                                                        )}>
                                                            {sub.subcategories.map(grandSub => (
                                                                <Link
                                                                    key={grandSub.id}
                                                                    href={`/products?category=${grandSub.slug || grandSub.id}`}
                                                                    className="block py-1.5 px-3 pl-8 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-100/50 rounded transition-colors"
                                                                    onClick={onClose}
                                                                    prefetch={false}
                                                                >
                                                                    • {grandSub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default MobileCategorySidebar;
