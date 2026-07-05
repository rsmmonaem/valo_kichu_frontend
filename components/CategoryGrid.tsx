"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/lib/api";

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-2 md:p-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug || cat.id}`}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 overflow-hidden transition-all duration-300 group"
        >
          {/* Image Section */}
          <div className="w-full aspect-[16/10] sm:aspect-auto sm:h-40 md:h-52 bg-gray-50 overflow-hidden">
            {(cat.image_url || cat.image) ? (
              <img
                src={getImageUrl(cat.image_url || cat.image)}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-bold text-blue-600 bg-blue-50">
                {cat.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-3 md:p-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;