"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/lib/api";

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  const addPrefixToImage = (url?: string) => {
    if (!url) return "";
    const parts = url.split("/");
    const filename = parts.pop();
    if (!filename) return url;
    return [...parts, "ss" + filename].join("/");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug || cat.id}`}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 overflow-hidden transition-all duration-300 group"
        >
          {/* Image Section */}
          <div className="w-full h-40 md:h-52 bg-gray-50 overflow-hidden">
            {cat.image ? (
              <img
                src={addPrefixToImage(cat.image_url)}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-600 bg-blue-50">
                {cat.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;