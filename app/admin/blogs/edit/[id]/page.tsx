"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { authFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { ArrowLeft, Upload, Save, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [seoOpen, setSeoOpen] = useState(false);

    const [form, setForm] = useState({
        title: '',
        category_id: '',
        description: '',
        thumbnail: '',
        status: true,
        is_featured: false,
        meta_title: '',
        meta_keywords: '',
        meta_description: '',
        meta_thumbnail: '',
    });

    useEffect(() => {
        // Fetch categories
        authFetch('/admin/v1/categories')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.data || []);
                setCategories(list);
            })
            .catch(() => {});

        // Fetch blog data
        authFetch(`/admin/v1/blogs/${id}`)
            .then(res => res.json())
            .then(blog => {
                setForm({
                    title: blog.title || '',
                    category_id: blog.category_id ? String(blog.category_id) : '',
                    description: blog.description || '',
                    thumbnail: blog.thumbnail || '',
                    status: blog.status ?? true,
                    is_featured: blog.is_featured ?? false,
                    meta_title: blog.meta_title || '',
                    meta_keywords: blog.meta_keywords || '',
                    meta_description: blog.meta_description || '',
                    meta_thumbnail: blog.meta_thumbnail || '',
                });
                setLoading(false);
            })
            .catch(() => {
                alert('Failed to load blog');
                setLoading(false);
            });
    }, [id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'meta_thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'blogs');

            try {
                const uploadRes = await authFetch('/admin/v1/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    setForm(prev => ({ ...prev, [field]: data.url || data.path }));
                }
            } catch (err) {
                alert('Image upload failed');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            alert('Title is required');
            return;
        }
        setSaving(true);

        try {
            const res = await authFetch(`/admin/v1/blogs/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...form,
                    category_id: form.category_id || null,
                }),
            });
            if (res.ok) {
                router.push('/admin/blogs');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update blog');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const thumbPreview = form.thumbnail ? getImageUrl(form.thumbnail) : '';
    const metaThumbPreview = form.meta_thumbnail ? getImageUrl(form.meta_thumbnail) : '';

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-400">Loading blog data...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/blogs" className="text-gray-400 hover:text-gray-700 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Edit Blog Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title *</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        placeholder="Enter blog title..."
                        required
                    />
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Category</label>
                    <select
                        value={form.category_id}
                        onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">— No Category —</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Thumbnail</label>
                    <div className="flex items-start gap-4">
                        {thumbPreview ? (
                            <div className="w-40 h-28 relative rounded-lg overflow-hidden border bg-gray-100">
                                <Image src={thumbPreview} alt="Thumbnail" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-40 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                No Image
                            </div>
                        )}
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium text-gray-700">
                            <Upload size={16} /> Upload Thumbnail
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'thumbnail')} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Description (Quill) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Description / Content</label>
                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <ReactQuill
                            theme="snow"
                            value={form.description}
                            onChange={(value: string) => setForm(prev => ({ ...prev, description: value }))}
                            style={{ minHeight: '300px' }}
                        />
                    </div>
                </div>

                {/* Status & Featured */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.status}
                            onChange={e => setForm(prev => ({ ...prev, status: e.target.checked }))}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Active (Published)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                            className="w-4 h-4 accent-yellow-500"
                        />
                        <span className="text-sm font-medium text-gray-700">⭐ Featured (Show in Carousel)</span>
                    </label>
                </div>

                {/* SEO Section (Collapsible) */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setSeoOpen(!seoOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                    >
                        <span className="text-base font-bold text-gray-800">🔍 SEO Settings</span>
                        {seoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {seoOpen && (
                        <div className="px-6 pb-6 space-y-4 border-t">
                            <div className="pt-4">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={form.meta_title}
                                    onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="SEO Page Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Keywords</label>
                                <input
                                    type="text"
                                    value={form.meta_keywords}
                                    onChange={e => setForm(prev => ({ ...prev, meta_keywords: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                                <textarea
                                    value={form.meta_description}
                                    onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Brief SEO description for search engines..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Meta Thumbnail (OG Image)</label>
                                <div className="flex items-start gap-4">
                                    {metaThumbPreview ? (
                                        <div className="w-32 h-20 relative rounded-lg overflow-hidden border bg-gray-100">
                                            <Image src={metaThumbPreview} alt="Meta Thumbnail" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium text-gray-700">
                                        <Upload size={14} /> Upload
                                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'meta_thumbnail')} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/blogs" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Update Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
}
