"use client";

import React, { useState, useEffect } from 'react';
import { getProducts, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger';

const HomeAllProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const res = await getProducts(page);

            if (res.status && res.data) {
                const newData = res.data.data;
                setProducts(prev => [...prev, ...newData]);
                setPage(res.data.current_page + 1);
                setHasMore(res.data.current_page < res.data.last_page);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more products on home", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3 italic">
                        <span className="h-[2px] w-8 bg-blue-600"></span>
                        Explore All Products
                        <span className="h-[2px] w-8 bg-blue-600"></span>
                    </h2>
                    <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-xs">Endless choices for your dropshipping business</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map((product, idx) => (
                        <ProductCard key={`${product.id}-${idx}`} product={product} />
                    ))}
                </div>

                <InfiniteScrollTrigger
                    onIntersect={loadMore}
                    isLoading={isLoading}
                    hasMore={hasMore}
                />
            </div>
        </section>
    );
};

export default HomeAllProducts;
