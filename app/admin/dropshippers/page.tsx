"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings,
  ShieldAlert,
  Search,
  TrendingUp,
  UserCheck,
  UserX,
  MoreVertical,
  Save,
  RefreshCw,
  Shield
} from 'lucide-react';
import { authFetch } from '@/lib/api';
import clsx from 'clsx';

const DropshipperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'security' | 'pending'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // State for Users
  const [users, setUsers] = useState<any[]>([]);

  // State for Settings
  const [settings, setSettings] = useState({
    global_margin: 30,
    sub_dropshipper_margin: 20,
    sub_sub_dropshipper_margin: 10
  });

  // State for Security
  const [bannedIps, setBannedIps] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await authFetch('/admin/v1/dropshipping/users');
        const data = await res.json();
        if (res.ok) setUsers(data.data.data);
      } else if (activeTab === 'settings') {
        const res = await authFetch('/admin/v1/dropshipping/settings');
        const data = await res.json();
        if (res.ok) setSettings(data.data);
      } else if (activeTab === 'pending') {
        const res = await authFetch('/admin/v1/dropshipping/users/pending');
        const data = await res.json();
        if (res.ok) setUsers(data.data.data);
      } else if (activeTab === 'security') {
        const res = await authFetch('/admin/v1/dropshipping/banned-ips');
        const data = await res.json();
        if (res.ok) setBannedIps(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/admin/v1/dropshipping/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      if (res.ok) alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const toggleBan = async (id: number) => {
    try {
      const res = await authFetch(`/admin/v1/dropshipping/banned-ips/${id}/toggle`, { method: 'POST' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this dropshipper?')) return;
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Dropshipper approved successfully!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve dropshipper');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${id}/toggle-status`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dropshipper? This action cannot be undone.')) return;
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Dropshipper deleted successfully!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete dropshipper');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dropshipping Management</h1>
          <p className="text-gray-500 font-medium">Configure network margins, manage users and monitor security.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            <UserCheck size={20} /> Create User
          </button>
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setActiveTab('users')}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
                activeTab === 'users' ? "bg-white text-blue-600 shadow-md" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="flex items-center gap-2"><Users size={18} /> Users</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
                activeTab === 'settings' ? "bg-white text-blue-600 shadow-md" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="flex items-center gap-2"><Settings size={18} /> Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
                activeTab === 'pending' ? "bg-white text-orange-600 shadow-md" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="flex items-center gap-2"><ShieldAlert size={18} /> Pending</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
                activeTab === 'security' ? "bg-white text-red-600 shadow-md" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="flex items-center gap-2"><Shield size={18} /> Security</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[600px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
            <RefreshCw size={48} className="text-blue-600 animate-spin" />
            <p className="text-gray-400 font-bold animate-pulse">Fetching latest data...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'users' && (
              <UserList 
                users={users} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                onEdit={(user: any) => {
                  setSelectedUser(user);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}
            {activeTab === 'pending' && (
              <UserList 
                users={users} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                showApproveAction={true} 
                onApprove={handleApprove}
                onEdit={(user: any) => {
                  setSelectedUser(user);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            )}
            {activeTab === 'settings' && <SettingsForm settings={settings} setSettings={setSettings} handleSave={handleSaveSettings} />}
            {activeTab === 'security' && <SecurityList ips={bannedIps} toggleBan={toggleBan} />}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchData();
          }}
          existingUsers={users}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            fetchData();
          }}
          existingUsers={users}
        />
      )}
    </div>
  );
};

const UserList = ({ users, searchTerm, setSearchTerm, showApproveAction, onApprove, onEdit, onDelete, onToggleStatus }: any) => {
  const filteredUsers = users.filter((u: any) =>
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.refer_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or code..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-none ring-2 ring-gray-200 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100 text-sm font-bold">
          {filteredUsers.length} Total Users
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest px-8">
              <th className="px-8 py-5">Partner</th>
              <th className="px-8 py-5">Level / Role</th>
              <th className="px-8 py-5">Upline</th>
              <th className="px-8 py-5">Margin %</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-sm border border-gray-200 uppercase">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none mb-1 text-base">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                      <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded uppercase text-gray-500 border border-gray-200 tracking-tighter mt-1 inline-block">Code: {user.refer_code}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={clsx(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                    user.role === 'dropshipper' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      user.role === 'sub_dropshipper' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                  )}>
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {user.parent ? (
                    <div>
                      <p className="text-sm font-bold text-gray-800">{user.parent.first_name} {user.parent.last_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{user.parent.role?.replace('_', ' ')}</p>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-gray-300 uppercase italic">Direct to Admin</span>
                  )}
                </td>
                <td className="px-8 py-6 text-base font-black text-gray-900">
                  {user.dropshipper_margin || 0}%
                </td>
                <td className="px-8 py-6 text-right">
                  {showApproveAction ? (
                    <button
                      onClick={() => onApprove(user.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 active:scale-95"
                    >
                      Approve
                    </button>
                  ) : (
                    <UserActionMenu 
                      user={user} 
                      onEdit={() => onEdit(user)} 
                      onDelete={() => onDelete(user.id)} 
                      onToggleStatus={() => onToggleStatus(user.id)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsForm = ({ settings, setSettings, handleSave }: any) => (
  <div className="p-12 max-w-4xl mx-auto">
    <div className="mb-12">
      <h3 className="text-2xl font-black text-gray-900 mb-2">Global Profit Margins</h3>
      <p className="text-gray-500 font-medium">These percentages determine the default markup applied to the base purchase price for each level.</p>
    </div>

    <form onSubmit={handleSave} className="space-y-10">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-2">Master Dropshipper Margin (%)</label>
          <div className="relative group">
            <TrendingUp size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              type="number"
              className="w-full pl-16 pr-8 py-6 rounded-3xl bg-gray-50 border-2 border-transparent group-hover:bg-white group-hover:border-emerald-100 focus:bg-white focus:border-emerald-500 text-3xl font-black text-gray-900 transition-all outline-none"
              value={settings.global_margin}
              onChange={(e) => setSettings({ ...settings, global_margin: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-2">Sub-Dropshipper Margin (%)</label>
          <div className="relative group">
            <TrendingUp size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="number"
              className="w-full pl-16 pr-8 py-6 rounded-3xl bg-gray-50 border-2 border-transparent group-hover:bg-white group-hover:border-blue-100 focus:bg-white focus:border-blue-500 text-3xl font-black text-gray-900 transition-all outline-none"
              value={settings.sub_dropshipper_margin}
              onChange={(e) => setSettings({ ...settings, sub_dropshipper_margin: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-2">Child Dropshipper Margin (%)</label>
          <div className="relative group">
            <TrendingUp size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="number"
              className="w-full pl-16 pr-8 py-6 rounded-3xl bg-gray-50 border-2 border-transparent group-hover:bg-white group-hover:border-indigo-100 focus:bg-white focus:border-indigo-500 text-3xl font-black text-gray-900 transition-all outline-none"
              value={settings.sub_sub_dropshipper_margin}
              onChange={(e) => setSettings({ ...settings, sub_sub_dropshipper_margin: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100">
        <button
          type="submit"
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Save size={24} /> Save Changes
        </button>
      </div>
    </form>
  </div>
);

const SecurityList = ({ ips, toggleBan }: any) => (
  <div className="p-0">
    <div className="p-8 border-b border-gray-100 bg-red-50/20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-lg shadow-red-200/50">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">Security Oversight</h3>
          <p className="text-gray-500 text-sm font-medium">Monitor suspicious activity and override automated bans.</p>
        </div>
      </div>
      <div className="bg-red-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl shadow-red-200">
        {ips.filter((i: any) => i.is_banned).length} Active Bans
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest px-8">
            <th className="px-8 py-5">IP Address</th>
            <th className="px-8 py-5 text-center">Hits</th>
            <th className="px-8 py-5">Ban Reason</th>
            <th className="px-8 py-5">Status</th>
            <th className="px-8 py-5 text-right">Protection Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {ips.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-8 py-32 text-center">
                <div className="flex flex-col items-center opacity-20">
                  <Shield size={64} className="mb-4" />
                  <p className="text-xl font-black uppercase tracking-tighter">No security flags</p>
                </div>
              </td>
            </tr>
          ) : ips.map((ip: any) => (
            <tr key={ip.id} className="hover:bg-red-50/10 transition-colors group">
              <td className="px-8 py-6">
                <span className="font-mono font-black text-gray-800 text-base">{ip.ip_address}</span>
              </td>
              <td className="px-8 py-6 text-center">
                <div className="inline-flex flex-col items-center">
                  <span className="text-xl font-black text-gray-900 leading-none">{ip.request_count}</span>
                  <span className="text-[10px] text-gray-400 font-black uppercase mt-1">Total Hits</span>
                </div>
              </td>
              <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                {ip.ban_reason || <span className="text-gray-300 italic">No reason provided</span>}
              </td>
              <td className="px-8 py-6">
                <span className={clsx(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm",
                  ip.is_banned ? "bg-red-100 text-red-600 border-red-200" : "bg-emerald-100 text-emerald-600 border-emerald-200"
                )}>
                  {ip.is_banned ? 'Restricted' : 'Safe / Monitored'}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <button
                  onClick={() => toggleBan(ip.id)}
                  className={clsx(
                    "px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95",
                    ip.is_banned ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200" : "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                  )}
                >
                  {ip.is_banned ? 'Whitenow' : 'Restrict Manual'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CreateUserModal = ({ onClose, onSuccess, existingUsers }: any) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'dropshipper',
    parent_id: '',
    margin: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/admin/v1/dropshipping/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Create New Dropshipper</h2>
            <p className="text-gray-500 font-medium text-sm">Fill in the details to register a new partner.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <UserX size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">First Name</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="Enter first name"
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Last Name</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="Enter last name"
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="email@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="+880..."
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Initial Password</label>
            <input
              required
              type="password"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
              placeholder="Minimum 8 characters"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Role / Level</label>
              <select
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none font-bold"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="dropshipper">Master Dropshipper</option>
                <option value="sub_dropshipper">Sub Dropshipper</option>
                <option value="sub_sub_dropshipper">Child Dropshipper</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Individual Margin % (Optional)</label>
              <input
                type="number"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="0 for default"
                onChange={(e) => setFormData({ ...formData, margin: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {formData.role !== 'dropshipper' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Assign Parent (Upline)</label>
              <select
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none font-bold"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">Select Parent Dropshipper</option>
                {existingUsers
                  .filter((u: any) =>
                    (formData.role === 'sub_dropshipper' && u.role === 'dropshipper') ||
                    (formData.role === 'sub_sub_dropshipper' && u.role === 'sub_dropshipper')
                  )
                  .map((u: any) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                  ))
                }
              </select>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Creating User...' : 'Create Partner Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DropshipperAdminDashboard;

const EditUserModal = ({ user, onClose, onSuccess, existingUsers }: any) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    password: '',
    role: user.role || 'dropshipper',
    parent_id: user.refer_by || '',
    margin: user.dropshipper_margin || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update user');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Edit Dropshipper</h2>
            <p className="text-gray-500 font-medium text-sm">Update partner details.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <UserX size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">First Name</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Last Name</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
              <input
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="+880..."
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">New Password (Leave blank to keep current)</label>
            <input
              type="password"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
              placeholder="Minimum 8 characters"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Role / Level</label>
              <select
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none font-bold"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="dropshipper">Master Dropshipper</option>
                <option value="sub_dropshipper">Sub Dropshipper</option>
                <option value="sub_sub_dropshipper">Child Dropshipper</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Individual Margin %</label>
              <input
                type="number"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                placeholder="0 for default"
                value={formData.margin}
                onChange={(e) => setFormData({ ...formData, margin: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {formData.role !== 'dropshipper' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Assign Parent (Upline)</label>
              <select
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none font-bold"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">Select Parent Dropshipper</option>
                {existingUsers
                  .filter((u: any) =>
                    (formData.role === 'sub_dropshipper' && u.role === 'dropshipper') ||
                    (formData.role === 'sub_sub_dropshipper' && u.role === 'sub_dropshipper')
                  )
                  .map((u: any) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                  ))
                }
              </select>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Partner Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserActionMenu = ({ user, onEdit, onDelete, onToggleStatus }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Edit Details
            </button>
            <button
              onClick={() => {
                onToggleStatus();
                setIsOpen(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-2 text-sm font-bold transition",
                user.is_active ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {user.is_active ? 'Restrict Account' : 'Activate Account'}
            </button>
            <div className="h-px bg-gray-50 my-1"></div>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition"
            >
              Delete Partner
            </button>
          </div>
        </>
      )}
    </div>
  );
};
