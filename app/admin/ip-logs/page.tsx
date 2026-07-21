"use client";

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Search, Loader2, ShieldAlert, RefreshCcw, Infinity as InfinityIcon, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function IpLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async (p = page, s = search) => {
        setLoading(true);
        try {
            const res = await authFetch(`/admin/v1/ip-logs?page=${p}&search=${encodeURIComponent(s)}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data);
                setTotalPages(data.last_page);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load IP logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page, search);
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs(1, search);
    };

    const handleReset = async (id: number) => {
        if (!confirm('Are you sure you want to reset the request count for this IP?')) return;
        try {
            const res = await authFetch(`/admin/v1/ip-logs/${id}/reset`, { method: 'POST' });
            if (res.ok) {
                toast.success('IP limit reset successfully');
                fetchLogs();
            } else {
                toast.error('Failed to reset IP');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleToggleUnlimited = async (id: number) => {
        try {
            const res = await authFetch(`/admin/v1/ip-logs/${id}/toggle-unlimited`, { method: 'POST' });
            if (res.ok) {
                toast.success('Unlimited status toggled');
                fetchLogs();
            } else {
                toast.error('Failed to toggle status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            const res = await authFetch(`/admin/v1/ip-logs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Log deleted successfully');
                fetchLogs();
            } else {
                toast.error('Failed to delete log');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">IP Logs & Limits</h1>
                        <p className="text-sm text-gray-500">Manage API limits and bans for Dropshippers/Users</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Search IP Address..."
                            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium border-b">IP Address</th>
                                <th className="px-6 py-4 font-medium border-b">Request Count</th>
                                <th className="px-6 py-4 font-medium border-b">Status</th>
                                <th className="px-6 py-4 font-medium border-b">Last Request</th>
                                <th className="px-6 py-4 font-medium border-b text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No IP logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{log.ip_address}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-600 font-mono">
                                                {log.is_unlimited ? (
                                                    <span className="text-green-600 flex items-center gap-1 font-semibold">
                                                        <InfinityIcon size={14} /> Unlimited
                                                    </span>
                                                ) : (
                                                    <span>{log.request_count} / 5000</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.is_banned ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {new Date(log.last_request_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleUnlimited(log.id)}
                                                    className={clsx(
                                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                                        log.is_unlimited 
                                                            ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" 
                                                            : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                                    )}
                                                    title={log.is_unlimited ? "Remove Unlimited" : "Make Unlimited"}
                                                >
                                                    {log.is_unlimited ? "Remove Limit" : "Make Unlimited"}
                                                </button>
                                                <button
                                                    onClick={() => handleReset(log.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                    title="Reset Requests to 0"
                                                >
                                                    <RefreshCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(log.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                    title="Delete Log"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
