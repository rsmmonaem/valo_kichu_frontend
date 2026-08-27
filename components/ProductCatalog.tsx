"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger';
import * as fpixel from '@/lib/fpixel';
import { trackSearch, trackViewItemList, mapProductToGAItem } from '@/lib/gtm';

interface ProductCatalogProps {
    initialProducts: Product[];
    initialMeta: any;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts, initialMeta }) => {
    const searchParams = useSearchParams();

    // Track Search & View Item List
    const searchVal = searchParams?.get('search');
    const categorySlug = searchParams?.get('category');
    const listId = categorySlug ? `category_${categorySlug}` : (searchVal ? 'search_results' : 'product_catalog');
    const listName = categorySlug ? `Category: ${categorySlug}` : (searchVal ? `Search: ${searchVal}` : 'Product Catalog');

    useEffect(() => {
        if (searchVal) {
            fpixel.event('Search', {
                search_string: searchVal
            });
            // GA4: Track search
            trackSearch(searchVal);
        }
    }, [searchVal]);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(initialMeta?.current_page || 1);
    const [hasMore, setHasMore] = useState(initialMeta ? initialMeta.current_page < initialMeta.last_page : false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    // GA4: Track view_item_list on product list load/change
    useEffect(() => {
        if (products && products.length > 0) {
            const gaItems = products.map((p, idx) => mapProductToGAItem(p, idx + 1, 1, undefined, listName, listId));
            trackViewItemList(gaItems, listId, listName);
        }
    }, [products, listId, listName]);

    // Trigger filtering loading state as soon as search params change
    useEffect(() => {
        setIsFiltering(true);
    }, [searchParams]);

    // Reset when search params change (except page)
    useEffect(() => {
        setProducts(initialProducts);
        setPage(initialMeta?.current_page || 1);
        setHasMore(initialMeta ? initialMeta.current_page < initialMeta.last_page : false);
        setIsFiltering(false);
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
            {isFiltering ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-pulse">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 space-y-3">
                            <div className="aspect-square bg-gray-200 rounded-lg w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products.length > 0 ? (
                        products.map((product, idx) => (
                            <ProductCard
                                key={`${product.id}-${idx}`}
                                product={product}
                                index={idx + 1}
                                listName={listName}
                                listId={listId}
                            />
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
            )}

            <InfiniteScrollTrigger
                onIntersect={loadMore}
                isLoading={isLoading}
                hasMore={hasMore}
            />
        </div>
    );
};

export default ProductCatalog;
