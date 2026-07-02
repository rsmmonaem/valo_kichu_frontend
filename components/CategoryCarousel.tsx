"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
    categories: Category[];
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    const getImageUrl = (url?: string) => {
        if (!url) return '';
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
        let cleanUrl = url;
        // If relative path, build full URL
        if (!url.startsWith('http')) {
            cleanUrl = `${baseUrl}/storage/${url.replace(/^\/?storage\/?/, '')}`;
        }
        cleanUrl = cleanUrl.replace('/storage/products/', '/storage/categories/');
        if (cleanUrl.includes('/storage/') && !cleanUrl.includes('/storage/categories/')) {
            cleanUrl = cleanUrl.replace('/storage/', '/storage/categories/');
        }
        return cleanUrl;
    };

    if (!categories || categories.length === 0) return null;

    return (
        <div className="relative group">
            {/* Scroll Buttons - Visible on Desktop Hover */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 shadow-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
                aria-label="Scroll left"
            >
                <ChevronLeft size={20} className="text-gray-700" />
            </button>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 shadow-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
                aria-label="Scroll right"
            >
                <ChevronRight size={20} className="text-gray-700" />
            </button>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-3 md:gap-4 scroll-smooth pb-4 no-scrollbar snap-x snap-mandatory px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* {categories.map(cat => (
                    <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug || cat.id}`}
                        className="snap-start flex-shrink-0 w-28 md:w-36 flex flex-col items-center bg-white border border-gray-100 rounded-xl p-3 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group/item"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-hover/item:scale-105 transition-transform duration-300 relative">
                            {cat.image || cat.icon ? (
                                <img
                                    src={cat.image?.startsWith('http') ? cat.image : `${process.env.NEXT_PUBLIC_API_URL}/storage/${cat.image}`}
                                    alt={cat.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-blue-600/10 bg-blue-600/5 text-2xl font-bold text-blue-600 uppercase">
                                    {cat.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-center text-xs md:text-sm font-medium text-gray-700 group-hover/item:text-blue-600 line-clamp-2 leading-tight">
                            {cat.name}
                        </span>
                    </Link>
                ))} */}
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug || cat.id}`}
                        className="snap-start flex-shrink-0 w-48 md:w-60 bg-white rounded-2xl 
               shadow-sm hover:shadow-xl transition-all duration-300 
               overflow-hidden border border-gray-100 hover:border-blue-200 group/item"
                    >
                        {/* Image Section */}
                        <div className="w-full h-40 md:h-52 bg-gray-50 overflow-hidden">
                            {(cat.image_url || cat.image) ? (
                                <img
                                    src={getImageUrl(cat.image_url || cat.image)}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center 
                        text-4xl font-bold text-blue-600 bg-blue-50">
                                    {cat.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                            <h3 className="text-base md:text-lg font-semibold text-gray-800 
                     group-hover/item:text-blue-600 transition-colors">
                                {cat.name}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryCarousel;
