"use client";

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { Filter, Eye, X, Calendar, Globe, MapPin } from 'lucide-react';
import clsx from 'clsx';

export default function VisitorsPage() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_unique: 0 });
    const [filter, setFilter] = useState('');
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

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            let url = `/admin/v1/visitors?page=${page}`;
            if (filter) url += `&filter=${filter}`;
            if (startDate && endDate) {
                url += `&start_date=${startDate}&end_date=${endDate}`;
            }

            const res = await authFetch(url);
            if (res.ok) {
                const data = await res.json();
                setVisitors(data.data.data);
                setTotalPages(data.data.last_page);
                setStats(data.stats);
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
                <h1 className="text-2xl font-bold text-gray-800">Actual Visitors</h1>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Globe size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Unique Visitors</p>
                        <p className="text-xl font-bold text-gray-800">{stats.total_unique}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">Preset Filters</label>
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setStartDate('');
                            setEndDate('');
                            setPage(1);
                        }}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Time</option>
                        <option value="daily">Today (Daily)</option>
                        <option value="monthly">This Month</option>
                    </select>
                </div>

                <div className="flex items-end gap-2">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleApplyDateFilter}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                    >
                        Apply Range
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                <th className="px-6 py-4 font-medium">IP Address</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Total Pages</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading visitors...
                                    </td>
                                </tr>
                            ) : visitors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No visitors found.
                                    </td>
                                </tr>
                            ) : (
                                visitors.map((visitor: any) => (
                                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {visitor.ip_address}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                {visitor.location || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(visitor.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                                                {visitor.page_views_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openVisitorModal(visitor.id)}
                                                className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors shadow-sm"
                                            >
                                                <Eye size={14} /> Views Pages
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
                            className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 bg-white border border-gray-200 rounded text-sm disabled:opacity-50"
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
