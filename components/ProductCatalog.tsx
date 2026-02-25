"use client";

import React from 'react';
import { Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';

interface ProductCatalogProps {
    initialProducts: Product[];
    initialMeta: any;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts, initialMeta }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {initialProducts.length > 0 ? (
                    initialProducts.map((product, idx) => (
                        <ProductCard key={`${product.id}-${idx}`} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-gray-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                            We couldn't find any products matching your filters. Try clearing them or using different keywords.
                        </p>
                    </div>
                )}
            </div>

            {initialMeta && initialMeta.last_page > 1 && (
                <Pagination meta={initialMeta} />
            )}
        </div>
    );
};

export default ProductCatalog;
