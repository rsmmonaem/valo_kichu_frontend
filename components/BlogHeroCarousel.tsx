"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Blog } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface BlogHeroCarouselProps {
    blogs: Blog[];
}

const BlogHeroCarousel: React.FC<BlogHeroCarouselProps> = ({ blogs }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (blogs.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % blogs.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [blogs.length]);

    if (blogs.length === 0) return null;

    const prev = () => setCurrent(c => (c - 1 + blogs.length) % blogs.length);
    const next = () => setCurrent(c => (c + 1) % blogs.length);

    const blog = blogs[current];
    const resolveThumb = (t?: string) => t ? (t.startsWith('/') ? t : getImageUrl(t)) : '';

    return (
        <div className="relative w-full h-[360px] md:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden group shadow-2xl">
            {/* Background Image */}
            {blogs.map((b, i) => {
                const url = resolveThumb(b.thumbnail);
                return (
                    <div
                        key={b.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                    >
                        {url ? (
                            <Image
                                src={url}
                                alt={b.title}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority={i === 0}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
                        )}
                    </div>
                );
            })}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14 z-20">
                {blog.category && (
                    <Link
                        href={`/blogs?category=${blog.category.slug}`}
                        className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 hover:bg-blue-700 transition uppercase tracking-wider"
                    >
                        {blog.category.name}
                    </Link>
                )}
                <Link href={`/blogs/${blog.slug}`}>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3 hover:text-blue-200 transition line-clamp-2 drop-shadow-lg">
                        {blog.title}
                    </h2>
                </Link>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {blog.views}
                    </span>
                </div>
            </div>

            {/* Navigation Arrows */}
            {blogs.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 p-2.5 rounded-full transition opacity-0 group-hover:opacity-100"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="text-white" size={22} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 p-2.5 rounded-full transition opacity-0 group-hover:opacity-100"
                        aria-label="Next"
                    >
                        <ChevronRight className="text-white" size={22} />
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {blogs.length > 1 && (
                <div className="absolute bottom-4 right-6 md:right-10 flex gap-2 z-30">
                    {blogs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-500' : 'w-3 bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogHeroCarousel;
