"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, ChevronRight, Loader2, Search } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { clsx } from 'clsx';

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const res = await authFetch(`/dropshipper/orders?page=${page}`);
            const data = await res.json();
            if (data.data) {
                setOrders(data.data);
                setMeta(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'delivered':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">My Orders</h2>
                            <p className="text-gray-500 font-medium italic">Track your customer orders and fulfillment status</p>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            className="pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-gray-900 min-w-[280px]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-500 font-medium">When you start selling, your orders will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-8 px-8">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                    <th className="pb-2 pl-4">Order ID</th>
                                    <th className="pb-2">Customer</th>
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2 text-right">Amount</th>
                                    <th className="pb-2 text-center">Status</th>
                                    <th className="pb-2 pr-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-4 bg-gray-50 group-hover:bg-white rounded-l-2xl border-y border-l border-gray-100 transition-colors font-black text-gray-900">
                                            #{order.order_number}
                                        </td>
                                        <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors overflow-hidden max-w-[200px]">
                                            <div className="font-bold text-gray-900 truncate">{order.shipping_address?.split(',')[0] || 'Guest'}</div>
                                            <div className="text-xs text-gray-400 font-medium truncate">{order.contact_number}</div>
                                        </td>
                                        <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors text-sm font-bold text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors text-right font-black text-blue-600">
                                            ৳ {parseFloat(order.total_price).toLocaleString()}
                                        </td>
                                        <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors text-center">
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                                                getStatusStyle(order.status)
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 bg-gray-50 group-hover:bg-white rounded-r-2xl border-y border-r border-gray-100 transition-colors text-right">
                                            <button className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Showing {orders.length} of {meta.total} orders
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchOrders(meta.current_page - 1)}
                                disabled={meta.current_page === 1}
                                className="px-6 py-2 rounded-xl text-xs font-black bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors uppercase tracking-widest"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => fetchOrders(meta.current_page + 1)}
                                disabled={meta.current_page === meta.last_page}
                                className="px-6 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors uppercase tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
