"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
    Shield,
    ShieldCheck,
    Plus,
    Search,
    Edit2,
    Trash2,
    Key,
    UserCheck,
    UserX,
    CheckCircle2,
    X,
    Users,
    Newspaper,
    Package,
    ShoppingCart,
    Lock,
    Eye,
    EyeOff,
    RefreshCw
} from "lucide-react";

interface StaffMember {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone: string;
    phone_number?: string;
    role: string;
    permissions: string[];
    is_active: boolean;
    created_at?: string;
}

const AVAILABLE_PERMISSIONS = [
    { id: "blogs", label: "Blogs & Articles", desc: "Create, edit, delete and publish blogs", icon: Newspaper },
    { id: "products", label: "Products & Catalog", desc: "Manage products, categories, brands & banners", icon: Package },
    { id: "orders", label: "Orders & Shipping", desc: "Manage customer/dropshipper orders & courier dispatch", icon: ShoppingCart },
    { id: "customers", label: "Customers & Leads", desc: "View customer profiles, checkout leads & visitors", icon: Users },
    { id: "dropshippers", label: "Dropshippers", desc: "Manage dropshipper approvals, wallets & withdrawals", icon: UserCheck },
    { id: "reports", label: "Reports & Analytics", desc: "View courier reports and sales metrics", icon: ShieldCheck },
    { id: "settings", label: "System & Home Settings", desc: "Configure global site settings and page content", icon: Shield },
    { id: "users", label: "Staff & User Roles", desc: "Manage employee accounts and permissions", icon: Lock },
];

const ROLE_PRESETS = [
    {
        id: "blogger",
        title: "Blogger / Content Writer",
        desc: "Access ONLY to Blog CRUD & article media",
        permissions: ["blogs"],
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
        id: "order_manager",
        title: "Order Manager",
        desc: "Manage customer orders, courier dispatch & reports",
        permissions: ["orders", "reports"],
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
        id: "product_manager",
        title: "Product Manager",
        desc: "Manage products, categories, brands & banners",
        permissions: ["products"],
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
        id: "admin",
        title: "Administrator",
        desc: "Full access to all store operational modules",
        permissions: ["blogs", "products", "orders", "customers", "dropshippers", "reports", "settings"],
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
        id: "super_admin",
        title: "Super Admin",
        desc: "Unrestricted master access including Staff management",
        permissions: ["*"],
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200"
    },
    {
        id: "custom",
        title: "Custom Employee",
        desc: "Customize granular permissions manually below",
        permissions: [],
        badgeColor: "bg-slate-50 text-slate-700 border-slate-200"
    }
];

export default function AdminStaffPage() {
    const { user: currentUser } = useAuth();
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        email: "",
        password: "",
        role: "blogger",
        permissions: ["blogs"] as string[],
        is_active: true
    });

    const isSuperAdmin = currentUser?.role === 'super_admin';

    // Fetch staff list
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await authFetch("/admin/v1/staff");
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            } else {
                toast.error("Failed to load staff list");
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Network error while loading staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingStaff(null);
        setFormData({
            name: "",
            phone_number: "",
            email: "",
            password: "",
            role: "blogger",
            permissions: ["blogs"],
            is_active: true
        });
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (staff: StaffMember) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            phone_number: staff.phone || staff.phone_number || "",
            email: staff.email || "",
            password: "",
            role: staff.role || "custom",
            permissions: staff.permissions || [],
            is_active: staff.is_active
        });
        setIsModalOpen(true);
    };

    // Handle Role Change & preset permissions
    const handleRoleChange = (newRole: string) => {
        const preset = ROLE_PRESETS.find(p => p.id === newRole);
        setFormData(prev => ({
            ...prev,
            role: newRole,
            permissions: preset && newRole !== 'custom' ? preset.permissions : prev.permissions
        }));
    };

    // Toggle single permission
    const togglePermission = (permId: string) => {
        setFormData(prev => {
            const current = [...prev.permissions];
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    // Toggle all permissions
    const toggleAllPermissions = () => {
        if (formData.permissions.length === AVAILABLE_PERMISSIONS.length || formData.permissions.includes('*')) {
            setFormData(prev => ({ ...prev, permissions: [] }));
        } else {
            setFormData(prev => ({ ...prev, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) }));
        }
    };

    // Save Staff
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone_number.trim()) {
            toast.error("Name and phone number are required");
            return;
        }

        if (!editingStaff && !formData.password) {
            toast.error("Password is required for new accounts");
            return;
        }

        setIsSaving(true);
        try {
            const url = editingStaff
                ? `/admin/v1/staff/${editingStaff.id}`
                : `/admin/v1/staff`;
            const method = editingStaff ? "PUT" : "POST";

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(editingStaff ? "Staff updated successfully" : "Staff created successfully");
                setIsModalOpen(false);
                fetchStaff();
            } else {
                toast.error(result.message || "Failed to save staff user");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle Active Status
    const handleToggleStatus = async (staff: StaffMember) => {
        try {
            const res = await authFetch(`/admin/v1/staff/${staff.id}/status`, {
                method: "PUT",
                body: JSON.stringify({ is_active: !staff.is_active })
            });

            if (res.ok) {
                toast.success(`Staff status ${!staff.is_active ? 'activated' : 'deactivated'}`);
                setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, is_active: !staff.is_active } : s));
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Status update error");
        }
    };

    // Delete Staff
    const handleDelete = async (staff: StaffMember) => {
        if (!confirm(`Are you sure you want to delete staff account: "${staff.name}"?`)) {
            return;
        }

        try {
            const res = await authFetch(`/admin/v1/staff/${staff.id}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Staff account deleted");
                setStaffList(prev => prev.filter(s => s.id !== staff.id));
            } else {
                toast.error(data.message || "Failed to delete staff account");
            }
        } catch (error) {
            toast.error("Delete error");
        }
    };

    // Filter staff
    const filteredStaff = staffList.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.phone && s.phone.includes(searchTerm)) ||
            (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = filterRole === "all" || s.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Counts
    const totalStaff = staffList.length;
    const activeStaff = staffList.filter(s => s.is_active).length;
    const bloggersCount = staffList.filter(s => s.role === 'blogger' || s.role === 'content_writer').length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff & Permissions</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Add employee IDs, assign dynamic roles, and restrict module permissions.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-102 active:scale-98"
                >
                    <Plus size={18} />
                    <span>Add New Staff</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Staff</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{totalStaff}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Accounts</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{activeStaff}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Newspaper size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Blog / Content Writers</p>
                        <h3 className="text-2xl font-extrabold text-gray-900">{bloggersCount}</h3>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-gray-500">Role:</span>
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-700"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Administrator</option>
                        <option value="blogger">Blogger / Writer</option>
                        <option value="order_manager">Order Manager</option>
                        <option value="product_manager">Product Manager</option>
                    </select>
                </div>
            </div>

            {/* Staff List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-sm">Loading staff members...</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <UserX size={36} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-base font-semibold text-gray-700">No staff members found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add a new staff member.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50/70 text-gray-700 font-semibold border-b border-gray-100 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="py-4 px-6">Staff Member</th>
                                    <th className="py-4 px-4">Contact Info</th>
                                    <th className="py-4 px-4">Assigned Role</th>
                                    <th className="py-4 px-4">Granted Permissions</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.map(staff => {
                                    const preset = ROLE_PRESETS.find(p => p.id === staff.role) || {
                                        title: staff.role.replace(/_/g, ' '),
                                        badgeColor: "bg-gray-50 text-gray-700 border-gray-200"
                                    };

                                    return (
                                        <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                                        {staff.name ? staff.name.charAt(0).toUpperCase() : "S"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 leading-snug">{staff.name}</h4>
                                                        <p className="text-[11px] text-gray-400 font-mono">ID: #{staff.id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-gray-800">{staff.phone || staff.phone_number}</p>
                                                    <p className="text-xs text-gray-400">{staff.email || "No email"}</p>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${preset.badgeColor}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {preset.title}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {staff.permissions?.includes('*') || staff.role === 'super_admin' ? (
                                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[11px] font-semibold border border-rose-200">
                                                            All Permissions (*)
                                                        </span>
                                                    ) : staff.permissions && staff.permissions.length > 0 ? (
                                                        staff.permissions.map(perm => (
                                                            <span key={perm} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium">
                                                                {perm}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">None assigned</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(staff)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${staff.is_active
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                        : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                                        }`}
                                                >
                                                    {staff.is_active ? "Active" : "Inactive"}
                                                </button>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(staff)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Role & Permissions"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {currentUser?.id !== staff.id && (
                                                        <button
                                                            onClick={() => handleDelete(staff)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Staff"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingStaff ? "Edit Staff & Permissions" : "Add New Employee / Staff"}
                                    </h3>
                                    <p className="text-xs text-gray-500">Configure login credentials and access levels.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-6 space-y-6">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Rahim Ahmed"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        Mobile Number (Login ID) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 01700000000"
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. employee@valokichu.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {editingStaff ? "New Password (Leave blank to keep current)" : "Password *"}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingStaff}
                                            placeholder={editingStaff ? "Leave blank to keep" : "At least 6 characters"}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Role Preset Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Select Role Template
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {ROLE_PRESETS.map(preset => {
                                        const isSelected = formData.role === preset.id;
                                        return (
                                            <div
                                                key={preset.id}
                                                onClick={() => handleRoleChange(preset.id)}
                                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs text-gray-900">{preset.title}</span>
                                                    {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-tight">{preset.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Granular Module Permissions */}
                            <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">Module Access Control</h4>
                                        <p className="text-xs text-gray-500">Check each module the staff member is authorized to access.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleAllPermissions}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Toggle All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isChecked = formData.permissions.includes(perm.id) || formData.permissions.includes('*');
                                        const Icon = perm.icon;

                                        return (
                                            <label
                                                key={perm.id}
                                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                                                    ? "bg-white border-blue-400 shadow-sm"
                                                    : "bg-white/60 border-gray-200 opacity-75 hover:opacity-100"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => togglePermission(perm.id)}
                                                    className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                                                        <Icon size={14} className="text-blue-600" />
                                                        <span>{perm.label}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{perm.desc}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                <div>
                                    <span className="font-bold text-sm text-gray-800">Account Status</span>
                                    <p className="text-xs text-gray-500">Allow this employee to sign in immediately.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
                                >
                                    {isSaving ? "Saving..." : editingStaff ? "Update Staff" : "Create Staff Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
