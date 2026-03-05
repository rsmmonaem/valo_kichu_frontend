"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Loader2, Search, ChevronRight, X } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { clsx } from 'clsx';

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

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

    const fetchOrderDetails = async (orderId: number) => {
        setFetchingDetails(true);
        try {
            const res = await authFetch(`/v1/order/info/${orderId}`);
            const result = await res.json();
            if (result && result.data) {
                setViewingOrder(result.data);
            } else if (result) {
                setViewingOrder(result);
            }
        } catch (err) {
            console.error('Failed to fetch order details', err);
        } finally {
            setFetchingDetails(false);
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
                            <p className="text-gray-500 font-medium italic">
                                Track your customer orders and fulfillment status
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                            size={18}
                        />
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
                        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">
                            Loading Orders...
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-500 font-medium">
                            When you start selling, your orders will appear here.
                        </p>
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
                                {orders.map((order) => {
                                    let shipping = { name: 'Guest' };
                                    try {
                                        shipping = JSON.parse(order.shipping_address || '{}');
                                    } catch {}
                                    return (
                                        <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 pl-4 bg-gray-50 group-hover:bg-white rounded-l-2xl border-y border-l border-gray-100 transition-colors font-black text-gray-900">
                                                #{order.order_number}
                                            </td>
                                            <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors overflow-hidden max-w-[200px]">
                                                <div className="font-bold text-gray-900 truncate">{shipping.name}</div>
                                                <div className="text-xs text-gray-400 font-medium truncate">{order.contact_number}</div>
                                            </td>
                                            <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors text-sm font-bold text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 bg-gray-50 group-hover:bg-white border-y border-gray-100 transition-colors text-right font-black text-blue-600">
                                                ৳ {parseFloat(order.total_price || order.subtotal || 0).toLocaleString()}
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
                                                 <button 
                                                    onClick={() => fetchOrderDetails(order.id)}
                                                    className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                                 >
                                                     <ChevronRight size={20} />
                                                 </button>
                                             </td>
                                        </tr>
                                    )
                                })}
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
                                onClick={() => fetchOrders(Math.max(meta.current_page - 1, 1))}
                                disabled={meta.current_page === 1}
                                className="px-6 py-2 rounded-xl text-xs font-black bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors uppercase tracking-widest"
                            >
                                Prev
                            </button>
                            <button 
                                onClick={() => fetchOrders(Math.min(meta.current_page + 1, meta.last_page))}
                                disabled={meta.current_page === meta.last_page}
                                className="px-6 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors uppercase tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Order Details</h3>
                                <p className="text-gray-500 font-bold">#{viewingOrder.order_number || viewingOrder.id}</p>
                            </div>
                            <button 
                                onClick={() => setViewingOrder(null)}
                                className="p-3 hover:bg-white text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {(() => {
                                let shipping = { name: 'N/A', phone: 'N/A', address: 'N/A', city: '' };
                                try {
                                    if (typeof viewingOrder.shipping_address === 'string' && viewingOrder.shipping_address.startsWith('{')) {
                                        shipping = JSON.parse(viewingOrder.shipping_address);
                                    } else if (typeof viewingOrder.shipping_address === 'object' && viewingOrder.shipping_address !== null) {
                                        shipping = viewingOrder.shipping_address;
                                    } else if (viewingOrder.shipping_address) {
                                        shipping.address = viewingOrder.shipping_address;
                                    }
                                } catch (e) {
                                    console.error("Error parsing shipping address", e);
                                }

                                const customerName = viewingOrder.name || shipping.name || 'N/A';
                                const customerPhone = viewingOrder.contact_number || shipping.phone || 'N/A';
                                const fullAddress = shipping.address ? `${shipping.address}${shipping.city ? ', ' + shipping.city : ''}` : viewingOrder.shipping_address;

                                return (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Info</h4>
                                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                                    <p className="font-black text-gray-900 text-lg mb-1">{customerName}</p>
                                                    <p className="text-gray-600 font-bold">{customerPhone}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</h4>
                                                <div className="flex flex-col gap-3">
                                                    <span className={clsx(
                                                        "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border inline-block text-center",
                                                        getStatusStyle(viewingOrder.status)
                                                    )}>
                                                        {viewingOrder.status}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-400 text-center italic">
                                                        Placed on {new Date(viewingOrder.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</h4>
                                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <p className="text-gray-700 font-bold leading-relaxed">
                                                    {fullAddress}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Items</h4>
                                <div className="space-y-3">
                                    {viewingOrder.products?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 transition-colors group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                                                {item.product?.image_url ? (
                                                    <img src={item.product.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-gray-900 truncate">{item.product_name}</p>
                                                <p className="text-xs text-gray-500 font-bold">{item.variation_snapshot}</p>
                                                <p className="text-xs text-blue-600 font-black mt-1">
                                                    {item.quantity} x ৳{parseFloat(item.price || item.unit_price || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">
                                                    ৳{(item.quantity * parseFloat(item.price || item.unit_price || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="font-black uppercase tracking-wider text-blue-400">{viewingOrder.payment_method || 'N/A'}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-800 hidden md:block" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                                    <p className="font-black uppercase tracking-wider text-emerald-400">{viewingOrder.payment_status}</p>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-white">
                                    ৳{parseFloat(viewingOrder.total_price || viewingOrder.subtotal || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Loader for Details */}
            {fetchingDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching Details...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;