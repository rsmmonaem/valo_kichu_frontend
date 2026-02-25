"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const HomeAllProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                // Fetch first page which now returns 40 products based on API update
                const res = await getProducts(1);
                if (res.status && res.data) {
                    setProducts(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load products on home", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialProducts();
    }, []);

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

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {products.map((product, idx) => (
                                <ProductCard key={`${product.id}-${idx}`} product={product} />
                            ))}
                        </div>

                        {products.length > 0 && (
                            <div className="mt-10 text-center">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm"
                                >
                                    See More Products
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default HomeAllProducts;
