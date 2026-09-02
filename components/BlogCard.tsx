import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Blog } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Eye, Clock, ArrowRight } from 'lucide-react';

interface BlogCardProps {
    blog: Blog;
    variant?: 'default' | 'horizontal' | 'compact';
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, variant = 'default' }) => {
    // Handle both API storage paths and local public paths (e.g. /demo-blogs/)
    const thumbUrl = blog.thumbnail
        ? (blog.thumbnail.startsWith('/') ? blog.thumbnail : getImageUrl(blog.thumbnail))
        : '';

    if (variant === 'horizontal') {
        return (
            <Link href={`/blogs/${blog.slug}`} className="group flex gap-5 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="w-32 h-24 md:w-44 md:h-32 relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {thumbUrl ? (
                        <Image src={thumbUrl} alt={blog.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-400 text-2xl font-bold">
                            {blog.title.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                    {blog.category && (
                        <span className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">{blog.category.name}</span>
                    )}
                    <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                        {blog.title}
                    </h3>
                    <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
                        <span className="flex items-center gap-1"><Clock size={12} />{new Date(blog.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Eye size={12} />{blog.views}</span>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/blogs/${blog.slug}`} className="group flex gap-4 items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition">
                <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {thumbUrl ? (
                        <Image src={thumbUrl} alt={blog.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-400 font-bold">
                            {blog.title.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-snug">{blog.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Eye size={11} />{blog.views} views</p>
                </div>
            </Link>
        );
    }

    // Default full card
    return (
        <Link href={`/blogs/${blog.slug}`} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
            <div className="w-full h-52 md:h-56 relative bg-gray-100 overflow-hidden">
                {thumbUrl ? (
                    <Image src={thumbUrl} alt={blog.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 flex items-center justify-center text-blue-300 text-5xl font-bold">
                        {blog.title.charAt(0)}
                    </div>
                )}
                {/* Category Badge */}
                {blog.category && (
                    <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {blog.category.name}
                    </div>
                )}
            </div>
            <div className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2 leading-snug">
                    {blog.title}
                </h3>
                {blog.description && (
                    <div className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.description }} />
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                        <span className="flex items-center gap-1"><Clock size={13} />{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Eye size={13} />{blog.views}</span>
                    </div>
                    <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
