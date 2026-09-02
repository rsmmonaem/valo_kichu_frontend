"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await authFetch('/admin/v1/blogs');
            const data = await res.json();
            if (Array.isArray(data)) setBlogs(data);
        } catch (e) {
            console.error('Failed to fetch blogs', e);
        } finally {
            setLoading(false);
        }
    };

    const deleteBlog = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await authFetch(`/admin/v1/blogs/${id}`, { method: 'DELETE' });
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (e) {
            alert('Failed to delete blog');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Blogs</h1>
                <Link href="/admin/blogs/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                    <Plus size={18} /> Add New Blog
                </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 w-16">Image</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Views</th>
                            <th className="p-4">Featured</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-400">Loading...</td></tr>
                        ) : blogs.length === 0 ? (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-400">No blogs found. Create your first blog post!</td></tr>
                        ) : blogs.map(blog => (
                            <tr key={blog.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                                        {blog.thumbnail ? (
                                            <Image src={getImageUrl(blog.thumbnail)} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">{blog.title?.charAt(0)}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{blog.title}</td>
                                <td className="p-4">
                                    {blog.category ? (
                                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{blog.category.name}</span>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-gray-500"><Eye size={14} />{blog.views}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${blog.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {blog.is_featured ? '⭐ Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${blog.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {blog.status ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/blogs/edit/${blog.id}`} className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1">
                                        <Edit size={15} /> Edit
                                    </Link>
                                    <button onClick={() => deleteBlog(blog.id)} className="text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                                        <Trash2 size={15} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
