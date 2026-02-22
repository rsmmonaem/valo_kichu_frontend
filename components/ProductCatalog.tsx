"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger';

interface ProductCatalogProps {
    initialProducts: Product[];
    initialMeta: any;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts, initialMeta }) => {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(initialMeta?.current_page || 1);
    const [hasMore, setHasMore] = useState(initialMeta ? initialMeta.current_page < initialMeta.last_page : false);
    const [isLoading, setIsLoading] = useState(false);

    // Reset when search params change (except page)
    useEffect(() => {
        // We only want to reset if filters other than page change
        // But since this is a new "page" load conceptually when filters change, 
        // and initialProducts will change because the parent server component re-renders,
        // we should sync with initialProducts.
        setProducts(initialProducts);
        setPage(initialMeta?.current_page || 1);
        setHasMore(initialMeta ? initialMeta.current_page < initialMeta.last_page : false);
    }, [initialProducts, initialMeta]);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        const nextPage = page + 1;

        try {
            const categorySlug = searchParams.get('category') || undefined;
            const search = searchParams.get('search') || undefined;
            const minPrice = searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined;
            const maxPrice = searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined;
            const sort = searchParams.get('sort') || undefined;

            const res = await getProducts(nextPage, categorySlug, search, minPrice, maxPrice, sort);

            if (res.status && res.data) {
                const newData = res.data.data;
                setProducts(prev => [...prev, ...newData]);
                setPage(res.data.current_page);
                setHasMore(res.data.current_page < res.data.last_page);
            }
        } catch (error) {
            console.error("Failed to load more products", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.length > 0 ? (
                    products.map((product, idx) => (
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

            <InfiniteScrollTrigger
                onIntersect={loadMore}
                isLoading={isLoading}
                hasMore={hasMore}
            />
        </div>
    );
};

export default ProductCatalog;
