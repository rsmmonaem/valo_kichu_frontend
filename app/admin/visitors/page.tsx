"use client";

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { Filter, Eye, X, Calendar, Globe, MapPin } from 'lucide-react';
import clsx from 'clsx';

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_unique: 0, today_unique: 0, filtered_total: 0 });
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchVisitors();
    }, [filter, page]);

    // Debounced search trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchVisitors();
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            let url = `/admin/v1/visitors?page=${page}`;
            if (filter) url += `&filter=${filter}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (startDate && endDate) {
                url += `&start_date=${startDate}&end_date=${endDate}`;
            }

            const res = await authFetch(url);
            if (res.ok) {
                const data = await res.json();
                setVisitors(data.data.data);
                setTotalPages(data.data.last_page);
                setStats(data.stats || { total_unique: 0, today_unique: 0, filtered_total: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyDateFilter = () => {
        setFilter(''); // clear preset filter when using date range
        setPage(1);
        fetchVisitors();
    };

    const openVisitorModal = async (visitorId: number) => {
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const res = await authFetch(`/admin/v1/visitors/${visitorId}/page-views`);
            if (res.ok) {
                const data = await res.json();
                setSelectedVisitor(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch visitor details', error);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVisitor(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Actual Visitors</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Real-time visitor logs, device info & Meta (FB) attribution</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Globe size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Unique</p>
                            <p className="text-lg font-bold text-gray-800">{stats.total_unique || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Active Today</p>
                            <p className="text-lg font-bold text-emerald-600">{stats.today_unique || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-wrap gap-4 items-end justify-between">
                <div className="flex flex-wrap items-end gap-3 flex-1 min-w-[280px]">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 mb-1 font-medium">Search</label>
                        <input
                            type="text"
                            placeholder="Search IP, location, or FB Event ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 font-medium">Preset Filter</label>
                        <select
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setStartDate('');
                                setEndDate('');
                                setPage(1);
                            }}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="">All Time</option>
                            <option value="daily">Active Today (Daily)</option>
                            <option value="monthly">Active This Month</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-end gap-2 flex-wrap">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 font-medium">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 font-medium">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleApplyDateFilter}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition font-medium cursor-pointer"
                    >
                        Apply Range
                    </button>
                    {(search || filter || startDate || endDate) && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setFilter('');
                                setStartDate('');
                                setEndDate('');
                                setPage(1);
                            }}
                            className="text-xs text-gray-500 hover:text-red-600 px-2 py-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                <th className="px-6 py-3.5">IP & Device</th>
                                <th className="px-6 py-3.5">Location</th>
                                <th className="px-6 py-3.5">Facebook (Meta) Event</th>
                                <th className="px-6 py-3.5">Last Active</th>
                                <th className="px-6 py-3.5">Pages</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Loading visitors...
                                    </td>
                                </tr>
                            ) : visitors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No visitors found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                visitors.map((visitor: any) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            <div>{visitor.ip_address}</div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {visitor.device_type && (
                                                    <span className={clsx(
                                                        "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                                                        visitor.device_type === 'Mobile' ? "bg-amber-50 text-amber-700" :
                                                        visitor.device_type === 'Tablet' ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-700"
                                                    )}>
                                                        {visitor.device_type}
                                                    </span>
                                                )}
                                                {visitor.referrer && (
                                                    <span className="text-[11px] text-gray-400 truncate max-w-[150px]" title={visitor.referrer}>
                                                        via {visitor.referrer.replace(/^https?:\/\//, '').split('/')[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-gray-400 shrink-0" />
                                                <span>{visitor.location || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {visitor.fb_event_id ? (
                                                <div className="space-y-1">
                                                    <span className="inline-flex items-center text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                                                        {visitor.fb_event_id}
                                                    </span>
                                                    {visitor.fbc && (
                                                        <div className="text-[10px] text-emerald-600 font-semibold">
                                                            ✓ FB Ad Click (fbclid)
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Direct / Organic</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-800">
                                                {new Date(visitor.last_visited_at || visitor.updated_at || visitor.created_at).toLocaleString()}
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                First: {new Date(visitor.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-semibold text-xs">
                                                {visitor.page_views_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openVisitorModal(visitor.id)}
                                                className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
                                            >
                                                <Eye size={13} /> View Pages
                                            </button>
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
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50 cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-800">
                                Page Views: {selectedVisitor?.ip_address}
                            </h3>
                            <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {modalLoading ? (
                                <div className="py-12 text-center text-gray-500">Loading page views...</div>
                            ) : (
                                <ul className="space-y-3">
                                    {selectedVisitor?.page_views?.map((pv: any) => (
                                        <li key={pv.id} className="flex gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-white shadow-sm transition-colors">
                                            <div className="bg-gray-50 p-2 rounded-lg text-gray-400 flex items-center justify-center h-fit">
                                                <Calendar size={16} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-blue-600 truncate mb-1">
                                                    <a href={pv.url} target="_blank" rel="noreferrer" className="hover:underline">
                                                        {pv.url}
                                                    </a>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(pv.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                    {selectedVisitor?.page_views?.length === 0 && (
                                        <li className="text-center text-gray-500 py-8">No page views recorded.</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-right">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
