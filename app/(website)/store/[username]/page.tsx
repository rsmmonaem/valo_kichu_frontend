import React from 'react';
import Link from 'next/link';
import { ChevronRight, Store, Info } from 'lucide-react';
import {
    getCategoryList,
    getBanners,
    getNewArrivals,
    getRecommendedProducts,
    getStoreInfo
} from '@/lib/api';
import CategorySidebar from '@/components/CategorySidebar';
import HeroSlider from '@/components/HeroSlider';
import CategoryCarousel from '@/components/CategoryCarousel';
import ProductCard from '@/components/ProductCard';
import HomeFeeds from '@/components/HomeFeeds';
import HomeAllProducts from '@/components/HomeAllProducts';
import StoreInitializer from '@/components/StoreInitializer';

export default async function StoreFront({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    // Parallel Fetching
    const [
        categoriesRes,
        banners,
        newArrivals,
        recommendedProducts,
        storeRes
    ] = await Promise.all([
        getCategoryList(),
        getBanners(),
        getNewArrivals(),
        getRecommendedProducts(),
        getStoreInfo(username)
    ]);

    const categories = categoriesRes.data || [];
    const store = storeRes.data || null;

    // Use store banner if available, otherwise fallback to global banners
    const displayBanners = store?.banner
        ? [{ id: 0, image: store.banner, title: store.name }]
        : banners;

    return (
        <div className="bg-gray-50 min-h-screen">
            <StoreInitializer username={username} />

            {/* Store Header Branding */}
            <div className="bg-emerald-600 text-white py-3">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Store size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 leading-none">Official Partner Store</p>
                            <h1 className="text-sm md:text-lg font-black tracking-tight">{store?.name || username}</h1>
                        </div>
                    </div>
                    {store?.slogan && (
                        <p className="hidden md:block text-sm italic font-medium opacity-90">"{store.slogan}"</p>
                    )}
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                        </span>
                        Verified Partner
                    </div>
                </div>
            </div>

            {/* Hero Slider Area */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <CategorySidebar categories={categories} />
                        <div className="col-span-12 md:col-span-9">
                            <HeroSlider banners={displayBanners} />
                        </div>
                    </div>
                </div>
            </div>

            {/* About the Store (If available) */}
            {store?.about && (
                <section className="py-8 bg-white border-y border-gray-100 mb-4">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl">
                            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <Info size={20} className="text-emerald-600" />
                                About Our Store
                            </h2>
                            <p className="text-gray-600 leading-relaxed italic">{store.about}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Category Carousel */}
            <section className="py-8 bg-white mb-4">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-600 rounded-full"></span>
                        Shop by Category
                    </h2>
                    <CategoryCarousel categories={categories} />
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-8 bg-white mb-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                            Newly Added in Store
                        </h2>
                        <Link href="/products?sort_by=newest" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {newArrivals.length > 0 ? (
                            newArrivals.map((product: any) => <ProductCard key={product.id} product={product} />)
                        ) : (
                            <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-lg">
                                Loading store items...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-4">
                <div className="container mx-auto px-4">
                    <HomeFeeds />
                </div>
            </section>

            {/* Recommended for You */}
            <section className="py-12 bg-emerald-50/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
                            <span className="h-[2px] w-8 bg-emerald-600"></span>
                            Partner Recommendations
                            <span className="h-[2px] w-8 bg-emerald-600"></span>
                        </h2>
                        <p className="text-gray-500 mt-2">Curated selection for our store visitors</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {recommendedProducts.map((product: any) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            </section>

            {/* Infinite Product Feed */}
            <HomeAllProducts />
        </div>
    );
}
