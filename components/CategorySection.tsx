"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/api';
import ProductCard from './ProductCard';
import { trackViewItemList, mapProductToGAItem } from '@/lib/gtm';

interface CategorySectionProps {
    title: string;
    categorySlug: string;
    products: Product[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, categorySlug, products }) => {
    const displayProducts = products.slice(0, 6);
    const listId = `category_section_${categorySlug}`;
    const listName = `Category Section: ${title}`;

    useEffect(() => {
        if (displayProducts && displayProducts.length > 0) {
            const gaItems = displayProducts.map((p, idx) => mapProductToGAItem(p, idx + 1, 1, undefined, listName, listId));
            trackViewItemList(gaItems, listId, listName);
        }
    }, [displayProducts.length, categorySlug, title]);

    return (
        <section className="py-8 border-b border-gray-100 bg-white mb-4">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-3">
                        <span className="bg-blue-600/10 text-blue-600 p-1.5 rounded-lg"><Star size={20} className="fill-blue-600" /></span>
                        {title}
                    </h3>
                    <Link href={`/products?category=${categorySlug}`} className="text-sm font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition" prefetch={false}>
                        View All <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 border-t border-gray-50 pt-4">
                    {displayProducts.length > 0 ? (
                        displayProducts.map((product, idx) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={idx + 1}
                                listName={listName}
                                listId={listId}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No products found in {title}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
