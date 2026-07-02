"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const BrandsPage = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", logo: "" });

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
        } catch (error) {
            console.error(error);
            toast.error("Failed to load brands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `/admin/v1/brands/${editingId}` : '/admin/v1/brands';
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await authFetch(url, {
                method,
                body: JSON.stringify({ name: formData.name, logo: formData.logo || undefined })
            });

            if (res.ok) {
                toast.success(editingId ? "Brand updated" : "Brand created");
                setIsModalOpen(false);
                setFormData({ name: "", logo: "" });
                setEditingId(null);
                fetchBrands();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Error occurred");
        }
    };

    const handleEdit = (brand: any) => {
        setEditingId(brand.id);
        setFormData({ name: brand.name, logo: brand.logo || "" });
        setIsModalOpen(true);
    };

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
        } catch (error) {
            toast.error("Error occurred");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
                <button
                    onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ name: "", logo: "" }); }}
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
                        <div key={brand.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag size={18} className="text-gray-400" />
                                    )}
                                </div>
                                <span className="font-medium text-gray-800">{brand.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(brand)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">No brands found. Click "Add Brand" to create one.</div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingId ? "Edit Brand" : "New Brand"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Nike, Samsung..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL <span className="text-gray-400 font-normal">(optional)</span></label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/logo.png"
                                    value={formData.logo}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                />
                                {formData.logo && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={formData.logo} alt="preview" className="w-10 h-10 rounded object-cover border" onError={e => (e.currentTarget.style.display = 'none')} />
                                        <span className="text-xs text-gray-400">Preview</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{editingId ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandsPage;
