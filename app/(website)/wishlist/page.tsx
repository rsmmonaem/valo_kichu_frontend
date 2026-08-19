"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.title = 'My Wishlist | Valokichu';
    }, []);

    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Heart size={48} className="text-gray-300" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h1>
                <p className="text-gray-500 mb-8 max-w-md">
                    Looks like you haven't added any items to your wishlist yet. Start browsing and add your favorite items!
                </p>
                <Link
                    href="/products"
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="text-red-500 fill-red-500" size={28} />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
                </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {wishlist.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
