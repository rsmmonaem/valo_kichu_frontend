import React, { Suspense } from 'react';
import { getBlogs, getFeaturedBlogs, getBlogCategories, getCategoryList, Blog, BlogCategory } from '@/lib/api';
import BlogHeroCarousel from '@/components/BlogHeroCarousel';
import BlogCategoryTabs from '@/components/BlogCategoryTabs';
import BlogCard from '@/components/BlogCard';

export const metadata = {
    title: 'Blog - Valo Kichu',
    description: 'Read the latest updates, tips, product insights, and articles from Valo Kichu.',
};

// Demo blog posts using real product categories
const DEMO_BLOGS: Blog[] = [
    {
        id: 1,
        title: 'Top 10 Gadgets & Electronics You Need in 2026',
        slug: 'top-10-gadgets-electronics',
        description: '<p>From smart home devices to cutting-edge wearables, discover the must-have gadgets that are redefining modern living. Our curated list features the most innovative electronics that combine functionality with sleek design.</p>',
        thumbnail: '/demo-blogs/electronics.jpg',
        views: 1250,
        status: true,
        is_featured: true,
        created_at: '2026-08-28T10:00:00Z',
        updated_at: '2026-08-28T10:00:00Z',
        category: { id: 1, name: 'Gadgets & Electronics', slug: 'gadgets-electronics' },
        meta_keywords: 'gadgets, electronics, smart devices, tech',
    },
    {
        id: 2,
        title: "Men's Fashion Guide: Premium Drop Shoulder Trends",
        slug: 'mens-fashion-drop-shoulder-trends',
        description: '<p>The drop shoulder silhouette continues to dominate streetwear and casual fashion. Learn how to style premium drop shoulder t-shirts for every occasion, from weekend outings to casual Fridays at work.</p>',
        thumbnail: '/demo-blogs/fashion.jpg',
        views: 980,
        status: true,
        is_featured: true,
        created_at: '2026-08-25T14:30:00Z',
        updated_at: '2026-08-25T14:30:00Z',
        category: { id: 17, name: 'Gents Premium Drop Shoulder', slug: 'gents-premium-drop-shoulder' },
        meta_keywords: 'mens fashion, drop shoulder, t-shirt, streetwear',
    },
    {
        id: 3,
        title: 'Transform Your Home: Essential Lifestyle Products',
        slug: 'essential-home-lifestyle-products',
        description: '<p>Your home should reflect your personality. Explore creative decor ideas and essential lifestyle products that blend comfort with aesthetics. From minimalist Scandinavian designs to warm cozy vibes.</p>',
        thumbnail: '/demo-blogs/home-decor.jpg',
        views: 760,
        status: true,
        is_featured: true,
        created_at: '2026-08-22T09:15:00Z',
        updated_at: '2026-08-22T09:15:00Z',
        category: { id: 4, name: 'Home & Lifestyle', slug: 'home-lifestyle' },
        meta_keywords: 'home, lifestyle, decor, interior design',
    },
    {
        id: 4,
        title: "Makeup & SkinCare: The Ultimate Routine for Glowing Skin",
        slug: 'ultimate-skincare-routine',
        description: '<p>Achieving radiant, healthy skin does not require expensive treatments. Discover the step-by-step skincare routine recommended by experts. From cleansing to moisturizing, choose the right products for your skin type.</p>',
        thumbnail: '/demo-blogs/skincare.jpg',
        views: 2100,
        status: true,
        is_featured: true,
        created_at: '2026-08-20T16:45:00Z',
        updated_at: '2026-08-20T16:45:00Z',
        category: { id: 26, name: "Makeup & SkinCare Item's", slug: 'makeup-skincare-items' },
        meta_keywords: 'skincare, makeup, beauty, glowing skin',
    },
    {
        id: 5,
        title: "Women's Fashion: Best Sharee Collection for Every Occasion",
        slug: 'best-sharee-collection',
        description: '<p>From elegant party wear to everyday comfort, explore the most beautiful sharee collections. We guide you through choosing the perfect fabric, color, and draping style for weddings, festivals, and casual wear.</p>',
        thumbnail: '/demo-blogs/shopping.jpg',
        views: 540,
        status: true,
        is_featured: false,
        created_at: '2026-08-18T11:00:00Z',
        updated_at: '2026-08-18T11:00:00Z',
        category: { id: 25, name: 'Sharee Collection', slug: 'sharee-collection' },
        meta_keywords: 'sharee, saree, womens fashion, traditional wear',
    },
    {
        id: 6,
        title: 'Best Watch Collection: Style Meets Functionality',
        slug: 'best-watch-collection-guide',
        description: '<p>Whether you prefer classic analog watches or feature-packed smartwatches, our comprehensive guide helps you choose the perfect timepiece. Explore top brands, trending designs, and tips for maintaining your watch.</p>',
        thumbnail: '/demo-blogs/fitness.jpg',
        views: 890,
        status: true,
        is_featured: false,
        created_at: '2026-08-15T08:30:00Z',
        updated_at: '2026-08-15T08:30:00Z',
        category: { id: 6, name: "Watch's", slug: 'watchs' },
        meta_keywords: 'watches, smartwatch, accessories, timepiece',
    },
];

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;

    // Fetch blog data and real categories in parallel
    const [apiBlogs, apiFeatured, apiBlogCategories, allCategoriesRes] = await Promise.all([
        getBlogs(category),
        getFeaturedBlogs(),
        getBlogCategories(),
        getCategoryList(),
    ]);

    // Use real product categories for the tabs
    const realCategories = (allCategoriesRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
    }));

    // Use API data if available, otherwise fall back to demo data
    const isDemo = apiBlogs.length === 0 && !category;
    const allBlogs = apiBlogs.length > 0 ? apiBlogs : (category
        ? DEMO_BLOGS.filter(b => b.category?.slug === category)
        : DEMO_BLOGS);
    const featuredBlogs = apiFeatured.length > 0 ? apiFeatured : DEMO_BLOGS.filter(b => b.is_featured);

    // For categories: use blog-specific categories from API if available, 
    // otherwise use real product categories
    const blogCategories = apiBlogCategories.length > 0
        ? apiBlogCategories
        : realCategories;

    // Pick featured blogs for the hero carousel
    const heroBlogs = featuredBlogs.length > 0 ? featuredBlogs : allBlogs.slice(0, 5);

    // For the grid, separate the first blog for the "lead story" layout if no category filter
    const isFiltered = !!category;
    const leadBlog = !isFiltered && allBlogs.length > 0 ? allBlogs[0] : null;
    const gridBlogs = !isFiltered ? allBlogs.slice(1) : allBlogs;

    // Trending / Most viewed blogs (top 5 by views)
    const trendingBlogs = [...allBlogs]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Demo Banner */}
            {isDemo && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                    ✨ Demo Mode — These are sample posts. Add real blogs from the Admin Panel!
                </div>
            )}

            {/* Hero Carousel Section */}
            {!isFiltered && heroBlogs.length > 0 && (
                <section className="bg-white">
                    <div className="container mx-auto px-4 py-6 md:py-8">
                        <BlogHeroCarousel blogs={heroBlogs} />
                    </div>
                </section>
            )}

            {/* Category Tabs Section */}
            <section className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <Suspense fallback={<div className="h-10" />}>
                        <BlogCategoryTabs categories={blogCategories} />
                    </Suspense>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {allBlogs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Posts Yet</h2>
                        <p className="text-gray-500">Check back soon for new articles and updates.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Section Title */}
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                    {isFiltered
                                        ? blogCategories.find(c => c.slug === category)?.name || 'Category'
                                        : 'Latest Stories'}
                                </h1>
                            </div>

                            {/* Lead Story - Large Card (only on unfiltered page) */}
                            {leadBlog && (
                                <div className="mb-8">
                                    <BlogCard blog={leadBlog} />
                                </div>
                            )}

                            {/* Blog Grid */}
                            {gridBlogs.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gridBlogs.map((blog: Blog) => (
                                        <BlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:w-[340px] flex-shrink-0">
                            {/* Trending Section */}
                            {trendingBlogs.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className="text-xl">🔥</span>
                                        <h3 className="text-lg font-bold text-gray-900">Trending Posts</h3>
                                    </div>
                                    <div className="space-y-1">
                                        {trendingBlogs.map((blog, i) => (
                                            <div key={blog.id} className="flex gap-3 items-start">
                                                <span className="text-2xl font-extrabold text-primary leading-none mt-1 select-none">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <BlogCard blog={blog} variant="compact" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories Quick Links */}
                            {blogCategories.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-5">📂 Categories</h3>
                                    <div className="space-y-2">
                                        {blogCategories.map(cat => (
                                            <a
                                                key={cat.id}
                                                href={`/blogs?category=${cat.slug}`}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${category === cat.slug
                                                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                                                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                                    }`}
                                            >
                                                <span>{cat.name}</span>
                                                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
