"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { authFetch } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { 
    ArrowLeft, 
    Upload, 
    Save, 
    ChevronDown, 
    ChevronUp, 
    Sparkles, 
    Eye, 
    Globe, 
    Tag, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Image as ImageIcon,
    Trash2,
    Clock,
    Layers,
    Share2,
    Search
} from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['code-block', 'clean'],
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'code-block'
];

export default function AdminBlogCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingMetaThumb, setUploadingMetaThumb] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [seoOpen, setSeoOpen] = useState(true);

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

    // Auto-generate slug preview
    const slugPreview = useMemo(() => {
        return form.title
            .trim()
            .replace(/[^\p{L}\p{N}\s-]/gu, '')
            .replace(/[\s_-]+/gu, '-')
            .replace(/^-+|-+$/gu, '') || 'your-blog-post-slug';
    }, [form.title]);

    // Word count & reading time calculation
    const { wordCount, readTime } = useMemo(() => {
        const text = form.description ? form.description.replace(/<[^>]*>/g, ' ').trim() : '';
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return { wordCount: words, readTime: minutes };
    }, [form.description]);

    useEffect(() => {
        // Fetch categories for selection
        authFetch('/admin/v1/categories')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.data || []);
                setCategories(list);
            })
            .catch(() => {
                toast.error('Failed to load categories');
            });
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'meta_thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'blogs');

            if (field === 'thumbnail') setUploadingThumb(true);
            else setUploadingMetaThumb(true);

            try {
                const uploadRes = await authFetch('/admin/v1/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    setForm(prev => ({ ...prev, [field]: data.path || data.url }));
                    toast.success('Image uploaded successfully');
                } else {
                    toast.error('Failed to upload image');
                }
            } catch (err) {
                toast.error('Image upload failed');
            } finally {
                if (field === 'thumbnail') setUploadingThumb(false);
                else setUploadingMetaThumb(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error('Please enter a blog title');
            return;
        }

        setSaving(true);
        const toastId = toast.loading('Publishing blog post...');

        try {
            const res = await authFetch('/admin/v1/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    category_id: form.category_id ? Number(form.category_id) : null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Blog post published successfully!', { id: toastId });
                setTimeout(() => {
                    router.push('/admin/blogs');
                }, 800);
            } else {
                toast.error(data.message || 'Failed to create blog', { id: toastId });
            }
        } catch (err) {
            toast.error('An unexpected error occurred', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const thumbPreview = form.thumbnail ? getImageUrl(form.thumbnail) : '';
    const metaThumbPreview = form.meta_thumbnail ? getImageUrl(form.meta_thumbnail) : '';

    return (
        <div className="min-h-screen bg-slate-50/70 pb-24">
            <Toaster position="top-right" />
            
            {/* Top Navigation / Sticky Header */}
            <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/admin/blogs" 
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <span>Admin</span>
                                <span>/</span>
                                <Link href="/admin/blogs" className="hover:text-blue-600 transition">Blogs</Link>
                                <span>/</span>
                                <span className="text-slate-700">New Article</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                Create New Blog Post
                                {form.is_featured && (
                                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        ⭐ Featured
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link 
                            href="/admin/blogs" 
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            Discard
                        </Link>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving || uploadingThumb || uploadingMetaThumb}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save size={16} />
                            <span>{saving ? 'Publishing...' : 'Publish Article'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Form Container */}
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left & Center Column (8 cols): Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Title & Slug Card */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Article Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full text-xl sm:text-2xl font-bold text-slate-900 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-300 placeholder:font-normal"
                                    placeholder="e.g., 10 Tips for Healthy Skin in Winter..."
                                    required
                                />
                            </div>

                            {/* Slug Preview */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 overflow-x-auto">
                                <Globe size={14} className="text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-400">URL Preview:</span>
                                <span className="font-mono text-blue-600 truncate">
                                    https://valokichu.com/blogs/<strong className="text-slate-800 font-bold">{slugPreview}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Rich Text Editor Card */}
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" />
                                    <h3 className="font-bold text-slate-900">Article Content</h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <FileText size={13} /> {wordCount} words
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={13} /> {readTime} min read
                                    </span>
                                </div>
                            </div>

                            {/* Quill Editor Component */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden [&_.ql-toolbar]:bg-slate-50/80 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[480px] [&_.ql-editor]:text-base [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition">
                                <ReactQuill
                                    theme="snow"
                                    value={form.description}
                                    onChange={(value: string) => setForm(prev => ({ ...prev, description: value }))}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Write your blog post content here... You can add headings, quotes, links, and format text."
                                />
                            </div>
                        </div>

                        {/* SEO Optimization Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setSeoOpen(!seoOpen)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/70 transition cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Search Engine Optimization (SEO)</h3>
                                        <p className="text-xs text-slate-500">Configure search engine titles, descriptions, and social preview cards</p>
                                    </div>
                                </div>
                                <div className="p-1 rounded-lg text-slate-400 bg-slate-100">
                                    {seoOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </button>

                            {seoOpen && (
                                <div className="px-6 sm:px-8 pb-8 space-y-6 border-t border-slate-100 pt-6">
                                    
                                    {/* Google SERP Snippet Preview */}
                                    <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/70 space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Search size={12} /> Google Search Result Preview
                                        </p>
                                        <div className="font-sans">
                                            <div className="text-xs text-slate-600 flex items-center gap-1">
                                                <span>valokichu.com</span>
                                                <span>›</span>
                                                <span className="text-slate-400">blogs</span>
                                                <span>›</span>
                                                <span className="text-slate-400 truncate max-w-xs">{slugPreview}</span>
                                            </div>
                                            <h4 className="text-blue-700 hover:underline text-lg font-medium cursor-pointer line-clamp-1 mt-0.5">
                                                {form.meta_title || form.title || 'Page Title will appear here'}
                                            </h4>
                                            <p className="text-slate-600 text-xs line-clamp-2 mt-1 leading-relaxed">
                                                {form.meta_description || 'Add a meta description to see how your article will look on Google search results.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Meta Title Input */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Meta Title
                                            </label>
                                            <span className={`text-[11px] font-mono ${form.meta_title.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                                {form.meta_title.length}/60 chars
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={form.meta_title}
                                            onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                            placeholder="Leave empty to use main article title"
                                        />
                                    </div>

                                    {/* Meta Description Input */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Meta Description
                                            </label>
                                            <span className={`text-[11px] font-mono ${form.meta_description.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                                {form.meta_description.length}/160 chars
                                            </span>
                                        </div>
                                        <textarea
                                            value={form.meta_description}
                                            onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                            rows={3}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none"
                                            placeholder="A concise summary of the article for search engines and social sharing..."
                                        />
                                    </div>

                                    {/* Meta Keywords */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Meta Keywords
                                        </label>
                                        <div className="relative">
                                            <Tag size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                value={form.meta_keywords}
                                                onChange={e => setForm(prev => ({ ...prev, meta_keywords: e.target.value }))}
                                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                                placeholder="e.g. ecommerce, health, shopping tips (comma separated)"
                                            />
                                        </div>
                                    </div>

                                    {/* OpenGraph / Social Share Thumbnail */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Social Share Image (OG Image)
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {metaThumbPreview ? (
                                                <div className="w-28 h-20 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
                                                    <Image src={metaThumbPreview} alt="OG" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, meta_thumbnail: '' }))}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-28 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                                    <Share2 size={16} />
                                                    <span className="text-[10px] mt-1">Default cover</span>
                                                </div>
                                            )}
                                            <div>
                                                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
                                                    <Upload size={14} />
                                                    <span>{uploadingMetaThumb ? 'Uploading...' : 'Custom OG Image'}</span>
                                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'meta_thumbnail')} className="hidden" />
                                                </label>
                                                <p className="text-[11px] text-slate-400 mt-1">Recommended: 1200x630px JPG or PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (4 cols): Sidebar & Settings */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Publishing Status Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Layers size={16} className="text-blue-600" />
                                Publishing Options
                            </h3>

                            {/* Status Switch (Published vs Draft) */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Article Visibility</p>
                                    <p className="text-[11px] text-slate-500">
                                        {form.status ? 'Published to live website' : 'Saved as private draft'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={form.status} 
                                        onChange={e => setForm(prev => ({ ...prev, status: e.target.checked }))}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {/* Featured Switch */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                                <div>
                                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        ⭐ Featured Post
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Highlight in homepage slider
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={form.is_featured} 
                                        onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Cover Image / Thumbnail Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                                <ImageIcon size={16} className="text-blue-600" />
                                Featured Image (Cover)
                            </h3>

                            {thumbPreview ? (
                                <div className="space-y-3">
                                    <div className="w-full h-48 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs group">
                                        <Image src={thumbPreview} alt="Cover" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                            <label className="cursor-pointer p-2.5 bg-white/90 hover:bg-white rounded-xl text-slate-800 transition shadow">
                                                <Upload size={16} />
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'thumbnail')} className="hidden" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                                                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-center text-[11px] text-slate-400">Click preview to change or delete</p>
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">
                                            {uploadingThumb ? 'Uploading image...' : 'Upload Cover Image'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'thumbnail')} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Category Selector Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Tag size={16} className="text-blue-600" />
                                Article Category
                            </h3>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Assign to Category
                                </label>
                                <select
                                    value={form.category_id}
                                    onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                >
                                    <option value="">— Uncategorized / General —</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Publish Box (Secondary Quick Action) */}
                        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
                            <div>
                                <h4 className="font-bold text-base flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-400" /> Ready to publish?
                                </h4>
                                <p className="text-xs text-blue-200/80 mt-1">
                                    Your post will be live and accessible to all store visitors immediately upon publishing.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={saving || uploadingThumb || uploadingMetaThumb}
                                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm shadow hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                <Save size={16} />
                                <span>{saving ? 'Publishing Post...' : 'Publish Blog Post Now'}</span>
                            </button>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}

