"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const BannersPage = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/admin/v1/banners');
            if (res.ok) {
                const data = await res.json();
                setBanners(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'banners');

            try {
                const uploadRes = await authFetch('/admin/v1/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();

                    // Construct full URL for validation
                    const fullUrl = data.url.startsWith('http')
                        ? data.url
                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${data.url.startsWith('/') ? '' : '/'}${data.url}`;

                    // Create banner after upload
                    const createRes = await authFetch('/admin/v1/banners', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image_url: fullUrl,
                            title: 'New Banner',
                            link: '#',
                            is_active: true
                        }),
                    });

                    if (createRes.ok) {
                        fetchBanners();
                        toast.success("Banner created successfully");
                    } else {
                        toast.error("Failed to save banner details");
                    }
                }
                console.log('image uploaded successfully');
            } catch (error) {
                console.error('Upload failed', error);
                toast.error("Upload failed");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await authFetch(`/admin/v1/banners/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Banner deleted");
                setBanners(banners.filter(b => b.id !== id));
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error occurred");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Banners</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upload Card */}
                <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 bg-gray-50 cursor-pointer hover:bg-gray-100 transition min-h-[200px]">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <Plus className="text-gray-500" size={24} />
                    </div>
                    <span className="font-medium text-gray-600">Upload New Banner</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>

                {/* Banner List */}
                {banners.map(banner => (
                    <div key={banner.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                        <div className="aspect-video bg-gray-100 relative">
                            <img
                                src={banner.image_url} // Use image_url from DB
                                className="w-full h-full object-cover"
                                alt={banner.title || "Banner"}
                                onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleDelete(banner.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="font-medium text-sm text-gray-800 truncate">{banner.title || "Untitled"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BannersPage;
