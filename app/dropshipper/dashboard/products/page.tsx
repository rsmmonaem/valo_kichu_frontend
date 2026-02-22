"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Package,
    ExternalLink,
    RefreshCw,
    ShoppingCart
} from 'lucide-react';
import { authFetch } from '@/lib/api';
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const ProductsPage = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    // ... rest of state
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // Debounced query
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Initial load and search reset
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }, [searchQuery]);

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchProducts = async (pageNum: number, isNewSearch = false) => {
        if (isLoading) return;

        setIsLoading(true);
        if (isNewSearch) setIsInitialLoading(true);

        try {
            const searchParam = searchQuery ? `&q=${encodeURIComponent(searchQuery).replace(/'/g, "%27")}` : '';
            const endpoint = `/dropshipper/products?page=${pageNum}${searchParam}`;
            const res = await authFetch(endpoint);
            const data = await res.json();

            if (res.ok) {
                const newProducts = data.data.data;
                const pagination = data.data;

                setProducts(prev => isNewSearch ? newProducts : [...prev, ...newProducts]);
                setHasMore(pagination.current_page < pagination.last_page);
                setPage(pagination.current_page + 1);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
            if (isNewSearch) setIsInitialLoading(false);
        }
    };

    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchProducts(page);
        }
    };

    const openPublicLink = (productCode: string) => {
        window.open(`/products/${productCode}`, '_blank');
    };

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id,
            name: product.name,
            slug: product.slug || product.product_code,
            price: product.your_price,
            base_price: product.base_price,
            image: product.images || '/placeholder.png',
            quantity: 1
        });
        toast.success('Added to cart!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">API Product Catalog</h2>
                    <p className="text-gray-500 font-medium text-sm">Browse and search products available for your dropshipping network.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search code, slug or name..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
                {isInitialLoading ? (
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                        <RefreshCw size={48} className="text-blue-600 animate-spin" />
                        <p className="text-gray-400 font-bold animate-pulse">Loading Products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                        <div className="p-6 bg-gray-50 rounded-full">
                            <Package size={64} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product, idx) => (
                                <div key={`${product.id}-${idx}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 h-full flex flex-col">
                                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                        <Image
                                            src={product.images || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                                                Product Code: {product.product_code || 'CODE'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                                            {product.name}
                                        </h3>

                                        <div className="mt-auto space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Buy Price</p>
                                                        <p className="text-lg font-black text-blue-600">৳ {product.your_price?.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-emerald-600">Your Profit</p>
                                                        <p className="text-lg font-black text-emerald-600">
                                                            +৳ {(parseFloat(product.base_price) - parseFloat(product.your_price)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Customer Retail</span>
                                                    <span className="text-sm font-bold text-gray-900">৳ {parseFloat(product.base_price).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                                                        In Stock
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openPublicLink(product.slug || product.product_code)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition active:scale-95"
                                                >
                                                    <ExternalLink size={14} /> View Link
                                                </button>
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition active:scale-95"
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <InfiniteScrollTrigger
                            onIntersect={loadMore}
                            isLoading={isLoading}
                            hasMore={hasMore}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
