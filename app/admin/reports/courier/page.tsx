"use client";

import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    Calendar, 
    Truck, 
    User, 
    HelpCircle, 
    DollarSign, 
    ShoppingBag, 
    CheckCircle, 
    XCircle,
    RotateCcw,
    Eye,
    Search
} from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import clsx from 'clsx';

interface CourierStats {
    courier_name: string;
    total_orders: number;
    total_revenue: number;
    success_rate: number;
    statuses: {
        pending: number;
        confirmed: number;
        shipping: number;
        delivered: number;
        cancelled: number;
        refunded: number;
        [key: string]: number;
    };
}

interface ReportData {
    summary: {
        total_orders: number;
        total_revenue: number;
    };
    couriers: CourierStats[];
}

export default function CourierReportsPage() {
    // Summary States
    const [summaryData, setSummaryData] = useState<ReportData | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    // Detailed Orders Table States
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // Filter States
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [courierFilter, setCourierFilter] = useState('');
    const [pageNameFilter, setPageNameFilter] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(20);
    const [sourcePages, setSourcePages] = useState<any[]>([]);

    const [statusCounts, setStatusCounts] = useState<any>({
        all: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
    });

    const statusTabs = [
        { key: "all", label: "All Orders", color: "gray" },
        { key: "pending", label: "Pending", color: "yellow" },
        { key: "confirmed", label: "Confirmed", color: "blue" },
        { key: "shipping", label: "Shipping", color: "orange" },
        { key: "delivered", label: "Delivered", color: "green" },
        { key: "cancelled", label: "Cancelled", color: "red" },
        { key: "refunded", label: "Refunded", color: "pink" },
    ];

    // Fetch Source Pages (Facebook Pages)
    const fetchSourcePages = async () => {
        try {
            const res = await authFetch('/admin/v1/source-pages');
            if (res.ok) {
                const json = await res.json();
                setSourcePages(json.data || []);
            }
        } catch (error) {
            console.error("Error fetching source pages:", error);
        }
    };

    // Fetch Top Courier Summary Stats
    const fetchSummaryReport = async () => {
        setLoadingSummary(true);
        try {
            let url = '/admin/v1/reports/courier';
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (pageNameFilter) params.append('page_name', pageNameFilter);
            if (courierFilter) params.append('courier_name', courierFilter);
            if (activeStatus !== "all") params.append('status', activeStatus);
            if (searchQuery) params.append('search', searchQuery);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await authFetch(url);
            if (res.ok) {
                const result = await res.json();
                setSummaryData(result);
            }
        } catch (error) {
            console.error("Error fetching courier report summary:", error);
        } finally {
            setLoadingSummary(false);
        }
    };

    // Fetch Detailed Orders Table
    const fetchDetailedOrders = async (page = currentPage) => {
        setLoadingOrders(true);
        try {
            const params = new URLSearchParams();
            if (activeStatus !== "all") params.append("status", activeStatus);
            if (startDate) params.append("start_date", startDate);
            if (endDate) params.append("end_date", endDate);
            if (searchQuery) params.append("search", searchQuery);
            if (courierFilter) params.append("courier_name", courierFilter);
            if (pageNameFilter) params.append("page_name", pageNameFilter);
            params.append("page", String(page));
            params.append("limit", String(perPage));

            const res = await authFetch(`/admin/v1/orders?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.data || []);
                setCurrentPage(data.current_page || 1);
                setLastPage(data.last_page || 1);
                setTotalOrders(data.total || 0);
                if (data.status_counts) {
                    setStatusCounts(data.status_counts);
                }
            }
        } catch (error) {
            console.error("Error fetching detailed orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchSourcePages();
    }, []);

    useEffect(() => {
        fetchSummaryReport();
        setCurrentPage(1);
        fetchDetailedOrders(1);
    }, [startDate, endDate, pageNameFilter, courierFilter, activeStatus, searchQuery, perPage]);

    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setCourierFilter('');
        setPageNameFilter('');
        setActiveStatus('all');
        setSearchQuery('');
    };

    const getCourierIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('steadfast')) {
            return <Truck className="text-blue-500" size={20} />;
        } else if (lower.includes('self')) {
            return <User className="text-emerald-500" size={20} />;
        }
        return <HelpCircle className="text-gray-500" size={20} />;
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            pending: "bg-yellow-100 text-yellow-700",
            confirmed: "bg-blue-100 text-blue-700",
            shipping: "bg-orange-100 text-orange-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
            refunded: "bg-pink-100 text-pink-700",
        };
        const labels: any = {
            pending: "Pending",
            confirmed: "Confirmed",
            shipping: "Shipping",
            delivered: "Delivered",
            cancelled: "Cancelled",
            refunded: "Refunded",
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${styles[status] || "bg-gray-100 text-gray-700"}`}>
                {labels[status] || status.replace(/_/g, " ")}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const styles: any = {
            unpaid: "bg-red-100 text-red-700",
            paid: "bg-green-100 text-green-750",
            partial: "bg-amber-100 text-amber-700",
        };
        const key = status ? status.toLowerCase() : "unpaid";
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles[key] || "bg-gray-100 text-gray-700"}`}>
                {key}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Datepicker */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" /> Courier Reports Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Analyze courier service performance, success rates, and filter order list.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm border-0 focus:ring-0 p-0 text-gray-700 bg-transparent"
                            placeholder="Start Date"
                        />
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm border-0 focus:ring-0 p-0 text-gray-700 bg-transparent"
                            placeholder="End Date"
                        />
                    </div>
                    {(startDate || endDate || courierFilter || searchQuery || activeStatus !== 'all') && (
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 flex items-center gap-1.5 text-xs font-semibold"
                            title="Reset all filters"
                        >
                            <RotateCcw size={14} /> Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Top Stats Cards */}
            {loadingSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-28 bg-gray-100 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* General Summary Card */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales Revenue</p>
                            <h3 className="text-3xl font-black text-gray-800">৳ {summaryData?.summary?.total_revenue?.toLocaleString() || 0}</h3>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                            From {summaryData?.summary?.total_orders} total filtered orders
                        </div>
                    </div>

                    {/* Steadfast Summary Card */}
                    {(() => {
                        const sf = summaryData?.couriers.find(c => c.courier_name.toLowerCase().includes('steadfast'));
                        return (
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Steadfast Delivery</p>
                                        <h3 className="text-3xl font-black text-gray-800">{sf?.total_orders || 0} <span className="text-xs font-medium text-gray-400">Orders</span></h3>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <Truck className="text-blue-500" size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                    <span>Success: {sf?.success_rate || 0}%</span>
                                    <span className="font-bold text-gray-800">৳ {sf?.total_revenue.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Self Delivery Summary Card */}
                    {(() => {
                        const sd = summaryData?.couriers.find(c => c.courier_name.toLowerCase().includes('self'));
                        return (
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Self Delivery</p>
                                        <h3 className="text-3xl font-black text-gray-800">{sd?.total_orders || 0} <span className="text-xs font-medium text-gray-400">Orders</span></h3>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-xl">
                                        <User className="text-emerald-500" size={24} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                    <span>Success: {sd?.success_rate || 0}%</span>
                                    <span className="font-bold text-gray-800">৳ {sd?.total_revenue.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Detailed Orders Title & Filter Box */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Order List by Courier</h3>
                    <p className="text-xs text-gray-500 mb-4">Detailed records of all courier dispatch events.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Query */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search Order ID, Name, Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Courier Select */}
                        <div>
                            <select
                                value={courierFilter}
                                onChange={(e) => setCourierFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-700"
                            >
                                <option value="">All Courier Services</option>
                                <option value="Steadfast">Steadfast</option>
                                <option value="Self Delivery">Self Delivery</option>
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>

                        {/* Page Source (Facebook Page) Select */}
                        <div>
                            <select
                                value={pageNameFilter}
                                onChange={(e) => setPageNameFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-700"
                            >
                                <option value="">All Page Sources</option>
                                {sourcePages.map((page: any) => (
                                    <option key={page.id} value={page.name}>
                                        {page.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Per Page */}
                        <div>
                            <input
                                type="number"
                                min="1"
                                placeholder="Per Page"
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value) || 20)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
                    <div className="flex gap-2 p-4 min-w-max">
                        {statusTabs.map((tab) => {
                            const isSelected = activeStatus === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveStatus(tab.key)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-2 border-2",
                                        isSelected
                                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-100 hover:bg-gray-100"
                                    )}
                                >
                                    {tab.label}
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                        isSelected ? "bg-slate-700 text-slate-100" : "bg-gray-200 text-gray-700"
                                    )}>
                                        {statusCounts[tab.key] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">SL</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Recipient</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Courier</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loadingOrders ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            Loading detailed order table...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((order, idx) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4 font-bold text-gray-400 text-xs">
                                            {(currentPage - 1) * perPage + idx + 1}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-xs text-blue-600">
                                            <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                                #{order.order_number || order.id}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-800 leading-tight">
                                                {order.name || order.user?.name || "Guest"}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {order.phone || order.contact_number}
                                            </p>
                                        </td>
                                        <td className="p-4 text-gray-600 text-xs">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">
                                            ৳{(order.total_amount || order.total_price).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            {order.courier_name ? (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                    {getCourierIcon(order.courier_name)}
                                                    {order.courier_name}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="p-4">
                                            {getPaymentStatusBadge(order.payment_status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <Eye size={12} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-gray-400">
                                        No matching orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 border-t border-gray-100 text-xs">
                        <p className="text-gray-500">
                            Showing page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
                            <span className="font-semibold text-gray-700">{lastPage}</span> &mdash;{" "}
                            <span className="font-semibold text-gray-700">{totalOrders}</span> total orders
                        </p>
                        <div className="flex gap-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                disabled={currentPage === lastPage}
                                onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                                className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
