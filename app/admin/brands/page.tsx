"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Upload, X } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const BrandsPage = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [brandName, setBrandName] = useState("");
    const [imageUrl, setImageUrl] = useState("");   // final URL stored in DB
    const [imagePreview, setImagePreview] = useState(""); // shown in preview
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ─── Fetch ─────────────────────────────────────── */
    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/admin/v1/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(Array.isArray(data) ? data : (data.data || []));
            } else {
                toast.error("Failed to load brands");
            }
        } catch (e) {
            toast.error("Failed to load brands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    /* ─── Reset modal state ──────────────────────────── */
    const openCreate = () => {
        setEditingId(null);
        setBrandName("");
        setImageUrl("");
        setImagePreview("");
        setIsModalOpen(true);
    };

    const openEdit = (brand: any) => {
        setEditingId(brand.id);
        setBrandName(brand.name);
        const url = brand.image_url || brand.image || "";
        setImageUrl(url);
        setImagePreview(url);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    /* ─── File upload ────────────────────────────────── */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local preview
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const form = new FormData();
            form.append("image", file);
            form.append("folder", "brands");

            const res = await authFetch("/admin/v1/upload", {
                method: "POST",
                body: form,
                // do NOT set Content-Type — browser must set multipart boundary
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.url || data.path || "");
                toast.success("Image uploaded");
            } else {
                toast.error("Image upload failed");
                setImagePreview("");
            }
        } catch {
            toast.error("Image upload failed");
            setImagePreview("");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImageUrl("");
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ─── Submit ─────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName.trim()) return;
        if (uploading) { toast.error("Please wait for image upload to finish"); return; }

        const url   = editingId ? `/admin/v1/brands/${editingId}` : '/admin/v1/brands';
        const method = editingId ? 'PUT' : 'POST';

        const payload: any = { name: brandName.trim() };
        if (imageUrl) payload.image = imageUrl;

        try {
            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingId ? "Brand updated" : "Brand created");
                closeModal();
                fetchBrands();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || "Operation failed");
            }
        } catch {
            toast.error("Error occurred");
        }
    };

    /* ─── Delete ─────────────────────────────────────── */
    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this brand?")) return;
        try {
            const res = await authFetch(`/admin/v1/brands/${id}`, { method: 'DELETE' });
            if (res.ok || res.status === 204) {
                toast.success("Brand deleted");
                fetchBrands();
            } else {
                toast.error("Failed to delete");
            }
        } catch {
            toast.error("Error occurred");
        }
    };

    /* ─── Render ─────────────────────────────────────── */
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Plus size={20} /> Add Brand
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full text-center text-gray-500 py-8">Loading brands...</div>
                ) : brands.length > 0 ? (
                    brands.map(brand => (
                        <div key={brand.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                    {(brand.image_url || brand.image) ? (
                                        <img
                                            src={brand.image_url || brand.image}
                                            alt={brand.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <Tag size={20} className="text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{brand.name}</p>
                                    <p className="text-xs text-gray-400">{brand.slug}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(brand)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-12">
                        <Tag size={40} className="mx-auto mb-3 text-gray-300" />
                        <p>No brands yet. Click <strong>Add Brand</strong> to create one.</p>
                    </div>
                )}
            </div>

            {/* ─── Modal ─────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">{editingId ? "Edit Brand" : "New Brand"}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Brand Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. Nike, Samsung..."
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Logo / Image
                                </label>

                                {imagePreview ? (
                                    <div className="relative w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group">
                                        <img
                                            src={imagePreview}
                                            alt="preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer"
                                    >
                                        <Upload size={24} />
                                        <span className="text-xs font-medium">Upload Image</span>
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-gray-400 mt-1.5">JPEG, PNG, GIF — max 2 MB</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {uploading ? "Uploading..." : editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandsPage;
