import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Eye, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { getBlogs } from '@/lib/api';
import BlogCard from '@/components/BlogCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com';

async function getBlog(slug: string) {
    const res = await fetch(`${API_BASE}/api/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

const DEMO_BLOGS = [
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    let blog = await getBlog(slug);
    
    if (!blog) {
        blog = DEMO_BLOGS.find(b => b.slug === slug);
    }

    if (!blog) return { title: 'Blog Not Found' };

    const baseUrl = API_BASE.replace(/\/api\/?$/, '');

    return {
        title: blog.meta_title || `${blog.title} - Valo Kichu`,
        description: blog.meta_description || blog.title,
        keywords: blog.meta_keywords || '',
        openGraph: {
            title: blog.meta_title || blog.title,
            description: blog.meta_description || blog.title,
            type: 'article',
            images: [
                blog.meta_thumbnail 
                    ? getImageUrl(blog.meta_thumbnail)
                    : (blog.thumbnail ? (blog.thumbnail.startsWith('/') ? blog.thumbnail : getImageUrl(blog.thumbnail)) : '')
            ].filter(Boolean),
        }
    };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let blog = await getBlog(slug);
    let isDemo = false;

    if (!blog) {
        const demoBlog = DEMO_BLOGS.find(b => b.slug === slug);
        if (demoBlog) {
            blog = demoBlog;
            isDemo = true;
        } else {
            notFound();
        }
    }

    const thumbUrl = blog.thumbnail ? (blog.thumbnail.startsWith('/') ? blog.thumbnail : getImageUrl(blog.thumbnail)) : '';

    // Fetch related blogs from same category
    let relatedBlogs: any[] = [];
    if (blog.category?.slug) {
        const categoryBlogs = await getBlogs(blog.category.slug);
        if (categoryBlogs.length > 0) {
            relatedBlogs = categoryBlogs.filter((b: any) => b.id !== blog.id).slice(0, 3);
        } else if (isDemo) {
            relatedBlogs = DEMO_BLOGS.filter((b: any) => b.category?.slug === blog.category?.slug && b.id !== blog.id).slice(0, 3);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Image */}
            {thumbUrl && (
                <div className="w-full h-72 md:h-[500px] lg:h-[560px] relative">
                    <Image 
                        src={thumbUrl}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Overlay Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                        <div className="container mx-auto max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Link 
                                    href="/blogs" 
                                    className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition"
                                >
                                    <ArrowLeft size={14} /> All Posts
                                </Link>
                                {blog.category && (
                                    <>
                                        <ChevronRight size={14} className="text-white/40" />
                                        <Link 
                                            href={`/blogs?category=${blog.category.slug}`}
                                            className="bg-blue-600/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-600 transition uppercase tracking-wider"
                                        >
                                            {blog.category.name}
                                        </Link>
                                    </>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                                {blog.title}
                            </h1>
                            <div className="flex items-center gap-5 text-white/70 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={15} />
                                    {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Eye size={15} />
                                    {blog.views} Views
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="container mx-auto px-4 py-10 md:py-14">
                <div className="max-w-4xl mx-auto">
                    {/* If no hero image, show the title here */}
                    {!thumbUrl && (
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Link href="/blogs" className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 transition">
                                    <ArrowLeft size={14} /> All Posts
                                </Link>
                                {blog.category && (
                                    <>
                                        <ChevronRight size={14} className="text-gray-300" />
                                        <Link 
                                            href={`/blogs?category=${blog.category.slug}`}
                                            className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-200 transition uppercase tracking-wider"
                                        >
                                            {blog.category.name}
                                        </Link>
                                    </>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{blog.title}</h1>
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1"><Clock size={14} />{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span className="flex items-center gap-1"><Eye size={14} />{blog.views} Views</span>
                            </div>
                        </div>
                    )}

                    {/* Blog Content */}
                    <article className="bg-white rounded-3xl p-6 md:p-10 lg:p-14 shadow-sm border border-gray-100">
                        <div 
                            className="prose prose-lg max-w-none text-gray-700
                                prose-headings:text-gray-900 prose-headings:font-bold
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:shadow-md
                                prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded-xl prose-blockquote:py-1 prose-blockquote:px-4
                                prose-code:bg-gray-100 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
                            " 
                            dangerouslySetInnerHTML={{ __html: blog.description || '' }} 
                        />
                    </article>

                    {/* Share / Tags */}
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {blog.meta_keywords && blog.meta_keywords.split(',').map((tag: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <div className="max-w-6xl mx-auto mt-16">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                            <h2 className="text-2xl font-extrabold text-gray-900">Related Posts</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((b: any) => (
                                <BlogCard key={b.id} blog={b} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
