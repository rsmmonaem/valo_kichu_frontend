"use client";

import React, { useEffect, useState } from 'react';
import { User, Search, Ban, CheckCircle, Edit, Trash2, X, AlertTriangle, ShieldCheck, Mail, Phone, Lock, Save } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

interface Customer {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    phone_number?: string;
    role?: string;
    orders_count?: number;
    is_active?: boolean;
    image?: string | null;
    created_at?: string;
}

const CustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'customer',
        is_active: true,
        password: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/admin/v1/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.data || data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        const action = currentStatus ? "block" : "unblock";
        if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;

        try {
            const res = await authFetch(`/admin/v1/customers/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (res.ok) {
                toast.success(`Customer ${action}ed`);
                setCustomers(customers.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
            } else {
                toast.error("Action failed");
            }
        } catch (e) {
            toast.error("Action failed");
        }
    };

    const handleOpenEdit = (customer: Customer) => {
        let firstName = customer.first_name || '';
        let lastName = customer.last_name || '';
        if (!firstName && customer.name) {
            const parts = customer.name.split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
        }

        setEditingCustomer(customer);
        setEditForm({
            first_name: firstName,
            last_name: lastName,
            email: customer.email || '',
            phone_number: customer.phone_number || customer.phone || '',
            role: customer.role || 'customer',
            is_active: customer.is_active !== false,
            password: '',
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        setIsSaving(true);
        try {
            const payload: any = {
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                email: editForm.email,
                phone_number: editForm.phone_number,
                role: editForm.role,
                is_active: editForm.is_active,
            };

            if (editForm.password && editForm.password.trim().length > 0) {
                payload.password = editForm.password;
            }

            const res = await authFetch(`/admin/v1/customers/${editingCustomer.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Customer updated successfully!");
                setIsEditModalOpen(false);
                setEditingCustomer(null);
                fetchCustomers();
            } else {
                const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to update customer');
                toast.error(errorMsg);
            }
        } catch (error) {
            toast.error("Network error while updating customer");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDelete = (customer: Customer) => {
        setDeletingCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingCustomer) return;

        setIsDeleting(true);
        try {
            const res = await authFetch(`/admin/v1/customers/${deletingCustomer.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Customer and all associated data deleted successfully!");
                setCustomers(customers.filter(c => c.id !== deletingCustomer.id));
                setIsDeleteModalOpen(false);
                setDeletingCustomer(null);
            } else {
                toast.error(data.message || "Failed to delete customer");
            }
        } catch (error) {
            toast.error("Network error while deleting customer");
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.phone_number && c.phone_number.includes(searchTerm))
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                    <p className="text-gray-500 text-sm">Manage customer accounts, roles, and order records.</p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm font-medium">
                    Total Customers: <span className="font-bold text-gray-900">{customers.length}</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search customers by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-16">ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Role</th>
                                <th className="p-4 text-center">Orders</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading customers...</td></tr>
                            ) : filtered.length > 0 ? (
                                filtered.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50/70 transition">
                                        <td className="p-4 text-gray-500 font-mono">#{customer.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold overflow-hidden border border-blue-100">
                                                    {customer.image ? <img src={customer.image} className="w-full h-full object-cover" /> : <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'No Name'}</p>
                                                    <p className="text-gray-400 text-xs">
                                                        {customer.created_at ? `Joined ${new Date(customer.created_at).toLocaleDateString()}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-800 font-medium">{customer.email || '—'}</p>
                                            <p className="text-gray-500 text-xs">{customer.phone_number || customer.phone || '—'}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                                                customer.role === 'dropshipper' ? "bg-purple-100 text-purple-700" :
                                                customer.role === 'admin' ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-700"
                                            )}>
                                                {customer.role || 'customer'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                                                {customer.orders_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                                                customer.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {customer.is_active !== false ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleOpenEdit(customer)}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                    title="Edit Customer"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Block / Unblock Button */}
                                                <button
                                                    onClick={() => toggleStatus(customer.id, customer.is_active !== false)}
                                                    className={clsx(
                                                        "p-2 rounded-lg transition",
                                                        customer.is_active !== false 
                                                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                                                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                    )}
                                                    title={customer.is_active !== false ? "Block Customer" : "Unblock Customer"}
                                                >
                                                    {customer.is_active !== false ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                </button>

                                                {/* Delete Button (Cascade) */}
                                                <button
                                                    onClick={() => handleOpenDelete(customer)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                    title="Delete with Cascade"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT CUSTOMER MODAL */}
            {isEditModalOpen && editingCustomer && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => !isSaving && setIsEditModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isSaving}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Edit size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
                                <p className="text-xs text-gray-500">ID #{editingCustomer.id} • {editingCustomer.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.first_name}
                                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editForm.last_name}
                                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
                                        placeholder="customer@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={editForm.phone_number}
                                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
                                        placeholder="017XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Account Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm bg-white"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="dropshipper">Dropshipper</option>
                                        <option value="sub_dropshipper">Sub Dropshipper</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editForm.is_active ? '1' : '0'}
                                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })}
                                        className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm bg-white"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Blocked</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition shadow-lg shadow-blue-600/25 disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CASCADE CONFIRMATION MODAL */}
            {isDeleteModalOpen && deletingCustomer && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 text-center relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Customer with Cascade?</h2>
                        
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-left mb-6 text-sm">
                            <p className="font-semibold text-red-900 mb-1">
                                {deletingCustomer.name} (#{deletingCustomer.id})
                            </p>
                            <p className="text-red-700 text-xs mb-3">{deletingCustomer.email} • {deletingCustomer.phone_number || deletingCustomer.phone || 'No Phone'}</p>
                            <div className="text-xs text-red-600 space-y-1">
                                <p>⚠️ <strong>Cascade Delete Action will permanently remove:</strong></p>
                                <ul className="list-disc list-inside space-y-0.5 pl-1">
                                    <li>Customer account & profile</li>
                                    <li>All {deletingCustomer.orders_count || 0} associated orders & items</li>
                                    <li>Cart items, saved addresses, and reviews</li>
                                    <li>All wallet logs and tokens</li>
                                </ul>
                                <p className="font-semibold pt-1">This action CANNOT be undone!</p>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-600/25 disabled:opacity-60"
                            >
                                <Trash2 size={18} />
                                {isDeleting ? 'Deleting Customer & Orders...' : 'Yes, Permanently Delete with Cascade'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-center" />
        </div>
    );
};

export default CustomersPage;

