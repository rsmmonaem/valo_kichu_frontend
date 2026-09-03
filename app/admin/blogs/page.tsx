"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { 
    Eye, 
    Edit, 
    Trash2, 
    Plus, 
    Search, 
    FileText, 
    Sparkles, 
    ExternalLink,
    Filter,
    CheckCircle2,
    Clock,
    RefreshCw
} from 'lucide-react';

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/admin/v1/blogs');
            const data = await res.json();
            if (Array.isArray(data)) setBlogs(data);
        } catch (e) {
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const deleteBlog = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
        const toastId = toast.loading('Deleting blog post...');
        try {
            const res = await authFetch(`/admin/v1/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBlogs(prev => prev.filter(b => b.id !== id));
                toast.success('Blog deleted successfully', { id: toastId });
            } else {
                toast.error('Failed to delete blog', { id: toastId });
            }
        } catch (e) {
            toast.error('Failed to delete blog', { id: toastId });
        }
    };

    // Filtering
    const filteredBlogs = useMemo(() => {
        return blogs.filter(b => {
            const matchesSearch = !searchQuery || 
                b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'all' ? true :
                statusFilter === 'published' ? Boolean(b.status) :
                !b.status;

            return matchesSearch && matchesStatus;
        });
    }, [blogs, searchQuery, statusFilter]);

    const totalViews = useMemo(() => blogs.reduce((acc, b) => acc + (b.views || 0), 0), [blogs]);
    const totalPublished = useMemo(() => blogs.filter(b => b.status).length, [blogs]);
    const totalFeatured = useMemo(() => blogs.filter(b => b.is_featured).length, [blogs]);

    return (
        <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <Toaster position="top-right" />

            {/* Page Header */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="text-slate-700 font-semibold">Blogs & Articles</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            Blog Management
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Publish and manage content to boost SEO and customer engagement
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={fetchBlogs}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                            title="Refresh list"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <Link 
                            href="/admin/blogs/create" 
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Plus size={18} /> Add New Article
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Posts</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileText size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{blogs.length}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalPublished}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Featured</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalFeatured}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Views</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Eye size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalViews.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by title or category..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                All ({blogs.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('published')}
                                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'published' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Published ({totalPublished})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('draft')}
                                className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'draft' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Drafts ({blogs.length - totalPublished})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blogs Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-4 px-6 w-20">Cover</th>
                                    <th className="py-4 px-6">Article Details</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6 text-center">Views</th>
                                    <th className="py-4 px-6 text-center">Featured</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6">Date</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            Loading blogs...
                                        </td>
                                    </tr>
                                ) : filteredBlogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-slate-400 font-medium">
                                            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                                            <p className="text-base text-slate-600 font-bold">No blog posts found</p>
                                            <p className="text-xs text-slate-400 mt-1">Get started by creating your first article</p>
                                            <Link 
                                                href="/admin/blogs/create"
                                                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                                            >
                                                <Plus size={14} /> Create Post
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBlogs.map(blog => {
                                        const thumbUrl = blog.thumbnail ? getImageUrl(blog.thumbnail) : '';
                                        return (
                                            <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="w-14 h-10 relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                        {thumbUrl ? (
                                                            <Image src={thumbUrl} alt="" fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                                                {blog.title?.charAt(0) || 'B'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="max-w-md">
                                                        <Link 
                                                            href={`/admin/blogs/edit/${blog.id}`}
                                                            className="font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1"
                                                        >
                                                            {blog.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                                                            <span className="truncate">/{blog.slug || 'slug'}</span>
                                                            {blog.slug && (
                                                                <Link 
                                                                    href={`/blogs/${blog.slug}`} 
                                                                    target="_blank"
                                                                    className="text-blue-600 hover:text-blue-800 shrink-0 inline-flex items-center gap-0.5"
                                                                    title="View on live website"
                                                                >
                                                                    <ExternalLink size={11} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    {blog.category ? (
                                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-lg inline-block">
                                                            {blog.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">—</span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-center font-mono text-xs text-slate-600">
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                                        <Eye size={12} className="text-slate-400" />
                                                        {(blog.views || 0).toLocaleString()}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6 text-center">
                                                    {blog.is_featured ? (
                                                        <span className="bg-amber-50 text-amber-700 border border-amber-200/70 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                            ⭐ Yes
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs font-medium">No</span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-center">
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${
                                                        blog.status 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}>
                                                        {blog.status ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                                                    {blog.created_at ? new Date(blog.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : '—'}
                                                </td>

                                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link 
                                                            href={`/admin/blogs/edit/${blog.id}`} 
                                                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                                                            title="Edit Blog"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button 
                                                            onClick={() => deleteBlog(blog.id, blog.title)} 
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                                            title="Delete Blog"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

