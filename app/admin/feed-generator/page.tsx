"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Download,
    Share2,
    RefreshCw,
    CheckCircle2,
    Copy,
    Trash2,
    ExternalLink,
    Filter,
    Layers,
    Check,
    AlertCircle,
    Info,
    Calendar,
    Search,
    ArrowUpDown,
    Plus,
    X,
    FileSpreadsheet,
    Eye
} from 'lucide-react';
import { authFetch, getCategoryList, Category } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import clsx from 'clsx';

interface SavedFeed {
    id: number;
    name: string;
    format: string;
    filters?: {
        category_ids?: number[];
        stock_status?: string;
        sort_by?: string;
        sort_order?: string;
    };
    field_mapping?: any;
    schedule_cron?: string;
    is_active: boolean;
    last_generated_at?: string;
    feed_url?: string;
    file_exists?: boolean;
}

interface PreviewProduct {
    id: number;
    name: string;
    category: string;
    price: string;
    sale_price?: string | null;
    current_stock: number;
    availability: string;
    image_url?: string;
    link: string;
    product_code?: string;
}

export default function FeedGeneratorPage() {
    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categorySearch, setCategorySearch] = useState('');

    // Filter controls
    const [categoryMode, setCategoryMode] = useState<'all' | 'custom'>('all');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'out_of_stock'>('in_stock');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [feedFormat, setFeedFormat] = useState<string>('facebook_csv');
    const [utmCampaign, setUtmCampaign] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Live Preview state
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>([]);
    const [totalProducts, setTotalProducts] = useState<number>(0);

    // Saved feeds state
    const [savedFeeds, setSavedFeeds] = useState<SavedFeed[]>([]);
    const [loadingSavedFeeds, setLoadingSavedFeeds] = useState(false);
    const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
    const [newFeedName, setNewFeedName] = useState('');
    const [isSavingFeed, setIsSavingFeed] = useState(false);
    const [generatingFeedId, setGeneratingFeedId] = useState<number | null>(null);

    // Active tab: 'generator' | 'saved'
    const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator');

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadSavedFeeds();
    }, []);

    // Flatten category hierarchy for easy selection
    const flattenCategories = (cats: Category[], prefix = ''): { id: number; name: string; fullPath: string }[] => {
        let list: { id: number; name: string; fullPath: string }[] = [];
        for (const cat of cats) {
            const currentPath = prefix ? `${prefix} > ${cat.name}` : cat.name;
            list.push({ id: cat.id, name: cat.name, fullPath: currentPath });
            if (cat.subcategories && cat.subcategories.length > 0) {
                list = list.concat(flattenCategories(cat.subcategories, currentPath));
            }
        }
        return list;
    };

    const flatCategoryList = useMemo(() => {
        return flattenCategories(categories);
    }, [categories]);

    const filteredFlatCategories = useMemo(() => {
        if (!categorySearch.trim()) return flatCategoryList;
        const q = categorySearch.toLowerCase();
        return flatCategoryList.filter(c => c.fullPath.toLowerCase().includes(q));
    }, [flatCategoryList, categorySearch]);

    const loadCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await getCategoryList();
            if (res.data) {
                setCategories(res.data);
            }
        } catch (err) {
            console.error('Failed to load categories', err);
            toast.error('Failed to load categories list');
        } finally {
            setLoadingCategories(false);
        }
    };

    const loadSavedFeeds = async () => {
        setLoadingSavedFeeds(true);
        try {
            const res = await authFetch('/admin/v1/feeds');
            if (res.ok) {
                const data = await res.json();
                setSavedFeeds(data.data || []);
            }
        } catch (err) {
            console.error('Failed to load saved feeds', err);
        } finally {
            setLoadingSavedFeeds(false);
        }
    };

    // Trigger preview when filters change
    const fetchPreview = async () => {
        setPreviewLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryMode === 'custom' && selectedCategoryIds.length > 0) {
                params.set('category_ids', selectedCategoryIds.join(','));
            }
            params.set('stock_status', stockStatus);
            params.set('sort_by', sortBy);
            params.set('sort_order', sortOrder);
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            }
            if (utmCampaign.trim()) {
                params.set('utm_campaign', utmCampaign.trim());
            }

            const res = await authFetch(`/admin/v1/feeds/preview?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setPreviewProducts(data.preview_products || []);
                setTotalProducts(data.total_products || 0);
            } else {
                toast.error('Failed to preview feed data');
            }
        } catch (err) {
            console.error('Failed to fetch preview', err);
            toast.error('Network error while previewing feed');
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPreview();
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryMode, selectedCategoryIds, stockStatus, sortBy, sortOrder, searchQuery, utmCampaign]);

    // Handle Category Toggles
    const toggleCategory = (id: number) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const selectAllCategories = () => {
        setSelectedCategoryIds(flatCategoryList.map(c => c.id));
    };

    const clearCategorySelection = () => {
        setSelectedCategoryIds([]);
    };

    // Direct CSV Download
    const handleDownloadCsv = async () => {
        const params = new URLSearchParams();
        if (categoryMode === 'custom' && selectedCategoryIds.length > 0) {
            params.set('category_ids', selectedCategoryIds.join(','));
        }
        params.set('stock_status', stockStatus);
        params.set('sort_by', sortBy);
        params.set('sort_order', sortOrder);
        if (utmCampaign.trim()) {
            params.set('utm_campaign', utmCampaign.trim());
        }
        params.set('feed_name', utmCampaign.trim() || `catalog_${stockStatus}`);
        params.set('download', '1');

        const toastId = toast.loading('Generating and downloading CSV feed...');

        try {
            const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            const downloadUrl = `${rawBase}/api/admin/v1/feeds/export?${params.toString()}`;

            const res = await fetch(downloadUrl, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!res.ok) {
                throw new Error('Failed to generate CSV export');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `product_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('CSV Feed downloaded successfully!', { id: toastId });
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download CSV feed', { id: toastId });
        }
    };

    // Save as persistent feed for Meta Scheduled Sync
    const handleSaveFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeedName.trim()) {
            toast.error('Please enter a name for the feed');
            return;
        }

        setIsSavingFeed(true);
        try {
            const payload: any = {
                name: newFeedName.trim(),
                format: feedFormat,
                filters: {
                    category_ids: categoryMode === 'custom' ? selectedCategoryIds : [],
                    stock_status: stockStatus,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                },
                is_active: true,
            };

            const res = await authFetch('/admin/v1/feeds', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                toast.success('Feed saved and generated successfully!');
                setIsSavingModalOpen(false);
                setNewFeedName('');
                loadSavedFeeds();
                setActiveTab('saved');
            } else {
                toast.error(data.message || data.errors?.name?.[0] || 'Failed to save feed');
            }
        } catch (err) {
            console.error('Error saving feed:', err);
            toast.error('Failed to save feed');
        } finally {
            setIsSavingFeed(false);
        }
    };

    // Regenerate a single saved feed
    const handleRegenerateFeed = async (id: number) => {
        setGeneratingFeedId(id);
        try {
            const res = await authFetch(`/admin/v1/feeds/${id}/generate`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                toast.success('Feed regenerated successfully!');
                loadSavedFeeds();
            } else {
                toast.error('Failed to regenerate feed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to regenerate feed');
        } finally {
            setGeneratingFeedId(null);
        }
    };

    // Delete a saved feed
    const handleDeleteFeed = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this feed?')) return;

        try {
            const res = await authFetch(`/admin/v1/feeds/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Feed deleted successfully');
                loadSavedFeeds();
            } else {
                toast.error('Failed to delete feed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete feed');
        }
    };

    // Copy URL to clipboard
    const copyToClipboard = (text: string, label = 'Feed URL') => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const getFullFeedUrl = (feed: SavedFeed) => {
        if (feed.feed_url) return feed.feed_url;
        const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
        const safe = feed.name.toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, '_');
        return `${rawBase}/storage/feeds/${safe}.csv`;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Share2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Feed Generator</h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Generate and export Facebook Catalog & Google Shopping CSV feeds filtered by category, stock, or all products.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('generator')}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                activeTab === 'generator'
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            Feed Generator
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'saved'
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            <span>Saved Feeds</span>
                            {savedFeeds.length > 0 && (
                                <span className={clsx(
                                    "px-1.5 py-0.5 text-xs rounded-full font-bold",
                                    activeTab === 'saved' ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                )}>
                                    {savedFeeds.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB 1: GENERATOR */}
            {activeTab === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Control Panel: Filters (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Filter size={18} className="text-blue-600" />
                                    <span>Filter & Options</span>
                                </h2>
                                <button
                                    onClick={fetchPreview}
                                    disabled={previewLoading}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <RefreshCw size={14} className={previewLoading ? "animate-spin" : ""} />
                                    <span>Refresh Count</span>
                                </button>
                            </div>

                            {/* 1. Category Filter Mode */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 block">
                                    1. Category Selection
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryMode('all')}
                                        className={clsx(
                                            "py-2 px-3 rounded-lg text-xs font-bold transition-all",
                                            categoryMode === 'all'
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        All Products
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryMode('custom')}
                                        className={clsx(
                                            "py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                            categoryMode === 'custom'
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        <span>Select Categories</span>
                                        {selectedCategoryIds.length > 0 && (
                                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full text-[10px]">
                                                {selectedCategoryIds.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Custom Categories Picker */}
                                {categoryMode === 'custom' && (
                                    <div className="space-y-3 pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="relative flex-1">
                                                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={categorySearch}
                                                    onChange={e => setCategorySearch(e.target.value)}
                                                    placeholder="Search category name..."
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={selectAllCategories}
                                                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    Select All
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={clearCategorySelection}
                                                    className="text-[11px] font-semibold text-gray-500 hover:underline cursor-pointer"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        {/* Categories Multi-Select List */}
                                        <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50 space-y-1 custom-scrollbar">
                                            {loadingCategories ? (
                                                <div className="text-xs text-gray-400 p-4 text-center">Loading categories...</div>
                                            ) : filteredFlatCategories.length === 0 ? (
                                                <div className="text-xs text-gray-400 p-4 text-center">No categories match your search</div>
                                            ) : (
                                                filteredFlatCategories.map(cat => {
                                                    const isChecked = selectedCategoryIds.includes(cat.id);
                                                    return (
                                                        <label
                                                            key={cat.id}
                                                            className={clsx(
                                                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors",
                                                                isChecked
                                                                    ? "bg-blue-50/80 text-blue-900 font-semibold"
                                                                    : "hover:bg-gray-100 text-gray-700"
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleCategory(cat.id)}
                                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                            />
                                                            <span className="truncate flex-1">{cat.fullPath}</span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 2. Stock Availability Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 block">
                                    2. Stock Availability
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'in_stock', label: 'In Stock Only' },
                                        { id: 'all', label: 'All Stock' },
                                        { id: 'out_of_stock', label: 'Out of Stock' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setStockStatus(item.id as any)}
                                            className={clsx(
                                                "py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all",
                                                stockStatus === item.id
                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Sorting Options */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                        Sort Products By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="id">Product ID</option>
                                        <option value="name">Product Name</option>
                                        <option value="price">Price</option>
                                        <option value="current_stock">Stock Quantity</option>
                                        <option value="created_at">Newest Added</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                        Order
                                    </label>
                                    <select
                                        value={sortOrder}
                                        onChange={e => setSortOrder(e.target.value as any)}
                                        className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="desc">Descending (High to Low)</option>
                                        <option value="asc">Ascending (Low to High)</option>
                                    </select>
                                </div>
                            </div>

                            {/* 4. Format & UTM Campaign Tag */}
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                        Feed Format
                                    </label>
                                    <select
                                        value={feedFormat}
                                        onChange={e => setFeedFormat(e.target.value)}
                                        className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="facebook_csv">Facebook / Meta Product Catalog (CSV)</option>
                                        <option value="google_csv">Google Merchant Center / Shopping (CSV)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                        UTM Campaign Tag (Optional for Ad tracking)
                                    </label>
                                    <input
                                        type="text"
                                        value={utmCampaign}
                                        onChange={e => setUtmCampaign(e.target.value)}
                                        placeholder="Leave empty for clean URLs (e.g. https://valokichu.com/products/slug)"
                                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Links will look like: <code className="text-blue-600">https://valokichu.com/products/slug{utmCampaign.trim() ? `?utm_source=facebook&utm_campaign=${utmCampaign.trim()}` : ''}</code>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
                                <button
                                    onClick={handleDownloadCsv}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all cursor-pointer text-sm"
                                >
                                    <Download size={18} />
                                    <span>Download CSV Feed Now</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setNewFeedName(`Catalog_${stockStatus}_${categoryMode === 'custom' ? selectedCategoryIds.length + '_cats' : 'all'}`);
                                        setIsSavingModalOpen(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm"
                                >
                                    <Share2 size={16} />
                                    <span>Save & Get Live Sync URL</span>
                                </button>
                            </div>
                        </div>

                        {/* Informational Help Box */}
                        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 space-y-2.5 text-xs text-blue-900">
                            <h3 className="font-bold flex items-center gap-2 text-blue-950">
                                <Info size={16} className="text-blue-600" />
                                <span>Facebook Catalog Tips</span>
                            </h3>
                            <ul className="list-disc pl-4 space-y-1 text-blue-800/90 text-[11px]">
                                <li><strong>Prices:</strong> Always includes standard currency code (e.g. <code>1200.00 BDT</code>).</li>
                                <li><strong>Links:</strong> Uses full frontend live URL (<code>https://valokichu.com/products/...</code>).</li>
                                <li><strong>Category:</strong> Automatically populated from product category hierarchy.</li>
                                <li><strong>Auto-Sync:</strong> Click "Save & Get Live Sync URL" to provide Meta Commerce Manager with an automatic daily data feed.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel: Live Data Preview (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Eye size={18} className="text-blue-600" />
                                        <span>Data Feed Preview</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Displaying sample products that will be included in the exported CSV.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                        {totalProducts} Products Matched
                                    </div>
                                </div>
                            </div>

                            {/* Search within preview */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search by title or product code..."
                                        className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-left text-xs text-gray-700">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                                        <tr>
                                            <th className="py-3 px-3">ID</th>
                                            <th className="py-3 px-3">Product</th>
                                            <th className="py-3 px-3">Category</th>
                                            <th className="py-3 px-3">Price</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3 text-right">Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewLoading ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-blue-600" />
                                                    Loading feed preview...
                                                </td>
                                            </tr>
                                        ) : previewProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-gray-400">
                                                    No products found matching these filters. Try adjusting your category or stock selection.
                                                </td>
                                            </tr>
                                        ) : (
                                            previewProducts.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                                                        #{p.id}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-2.5 max-w-xs">
                                                            {p.image_url ? (
                                                                <img
                                                                    src={getImageUrl(p.image_url)}
                                                                    alt={p.name}
                                                                    className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                                                                    onError={(e: any) => { 
                                                                        e.currentTarget.onerror = null;
                                                                        e.currentTarget.src = '/placeholder.png'; 
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                                                    <FileSpreadsheet size={16} />
                                                                </div>
                                                            )}
                                                            <div className="truncate">
                                                                <p className="font-semibold text-gray-900 truncate" title={p.name}>
                                                                    {p.name}
                                                                </p>
                                                                {p.product_code && (
                                                                    <p className="text-[10px] text-gray-400 font-mono">
                                                                        SKU: {p.product_code}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-600 truncate max-w-[130px]">
                                                        {p.category}
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <p className="font-bold text-gray-900">{p.price}</p>
                                                        {p.sale_price && (
                                                            <p className="text-[10px] text-emerald-600 font-semibold">
                                                                Sale: {p.sale_price}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                                            p.current_stock > 0
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-rose-100 text-rose-800"
                                                        )}>
                                                            {p.availability} ({p.current_stock})
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                        <a
                                                            href={p.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-[11px]"
                                                        >
                                                            <span>View</span>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalProducts > 15 && (
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Showing top 15 sample rows. All {totalProducts} products will be included in the exported CSV.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SAVED FEEDS */}
            {activeTab === 'saved' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-600" />
                                    <span>Automated Data Feeds</span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Scheduled CSV feeds with permanent public URLs that Meta Commerce Manager or Google Merchant can fetch automatically.
                                </p>
                            </div>

                            <button
                                onClick={() => setActiveTab('generator')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>Create New Feed</span>
                            </button>
                        </div>

                        {loadingSavedFeeds ? (
                            <div className="py-12 text-center text-gray-400">Loading saved feeds...</div>
                        ) : savedFeeds.length === 0 ? (
                            <div className="py-12 text-center space-y-3">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                    <Share2 size={24} />
                                </div>
                                <h3 className="text-base font-bold text-gray-800">No Automated Feeds Saved Yet</h3>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                    Use the Feed Generator tab to configure category filters and click "Save & Get Live Sync URL" to create a permanent feed.
                                </p>
                                <button
                                    onClick={() => setActiveTab('generator')}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition"
                                >
                                    Go to Generator
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedFeeds.map(feed => {
                                    const fullUrl = getFullFeedUrl(feed);
                                    const isGenerating = generatingFeedId === feed.id;

                                    return (
                                        <div
                                            key={feed.id}
                                            className="border border-gray-200 hover:border-blue-300 rounded-2xl p-5 bg-gray-50/50 hover:bg-white transition-all space-y-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                        <h3 className="font-bold text-gray-900 text-base">{feed.name}</h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Format: <span className="font-semibold text-gray-700 uppercase">{feed.format}</span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteFeed(feed.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Feed"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Feed Public URL */}
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                                                    Meta Catalog Sync URL
                                                </label>
                                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={fullUrl}
                                                        className="text-xs text-gray-700 bg-transparent flex-1 outline-none font-mono"
                                                    />
                                                    <button
                                                        onClick={() => copyToClipboard(fullUrl, 'Feed URL')}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                                                        title="Copy URL"
                                                    >
                                                        <Copy size={13} />
                                                        <span>Copy</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Metadata & Actions */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                                                <span className="text-gray-400 text-[11px]">
                                                    Last generated: {feed.last_generated_at ? new Date(feed.last_generated_at).toLocaleString() : 'Pending'}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRegenerateFeed(feed.id)}
                                                        disabled={isGenerating}
                                                        className="text-xs font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                                                        <span>Regenerate</span>
                                                    </button>
                                                    <a
                                                        href={fullUrl}
                                                        download
                                                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <Download size={12} />
                                                        <span>Download</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Save Feed */}
            {isSavingModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Share2 size={20} className="text-blue-600" />
                                <span>Save Automated Feed</span>
                            </h3>
                            <button
                                onClick={() => setIsSavingModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveFeed} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                                    Feed Name (Unique Identifier)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newFeedName}
                                    onChange={e => setNewFeedName(e.target.value)}
                                    placeholder="e.g. facebook_all_in_stock"
                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    A permanent public URL will be created based on this name.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                                <p><strong>Active Filters:</strong></p>
                                <p>• Categories: {categoryMode === 'all' ? 'All Categories' : `${selectedCategoryIds.length} categories selected`}</p>
                                <p>• Stock: <span className="capitalize">{stockStatus.replace('_', ' ')}</span></p>
                                <p>• Format: Facebook Catalog CSV</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSavingModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingFeed}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingFeed ? 'Saving...' : 'Save & Generate URL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
