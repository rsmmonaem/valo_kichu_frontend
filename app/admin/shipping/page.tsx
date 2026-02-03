"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface ShippingMethod {
    id: number;
    name: string;
    cost: number;
    is_active: boolean;
}

const ShippingPage = () => {
    const [methods, setMethods] = useState<ShippingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        cost: ''
    });

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/admin/v1/shipping-methods');
            if (res.ok) {
                const data = await res.json();
                setMethods(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch shipping methods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authFetch('/admin/v1/shipping-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    cost: parseFloat(formData.cost),
                    is_active: true
                }),
            });

            if (res.ok) {
                toast.success("Shipping method added");
                setFormData({ name: '', cost: '' });
                fetchMethods();
            } else {
                toast.error("Failed to add method");
            }
        } catch (error) {
            toast.error("Error occurred");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await authFetch(`/admin/v1/shipping-methods/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Method deleted");
                setMethods(methods.filter(m => m.id !== id));
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error occurred");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Truck className="text-blue-600" /> Shipping Methods
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-bold text-gray-700 mb-4">Add New Method</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Method Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Inside Dhaka"
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Cost (৳)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="e.g. 60"
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                            Add Method
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-medium text-gray-600">Name</th>
                                    <th className="p-4 font-medium text-gray-600">Cost</th>
                                    <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {methods.map(method => (
                                    <tr key={method.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-800">{method.name}</td>
                                        <td className="p-4 text-gray-600 font-bold">৳{method.cost}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete(method.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {methods.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-400">
                                            No shipping methods found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
