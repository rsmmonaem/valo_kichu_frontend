"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { ShoppingBag, Calendar, Package, ChevronRight, XCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { getImageUrl } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status?: string;
    total_price: string;
    created_at: string;
    products: Array<{
        price: string;
        quantity: number;
        product: {
            name: string;
            images: string[];
        };
        variant?: {
            size?: string;
            color?: string;
        };
    }>;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await authFetch("/v1/order/info");
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    const canCancelOrder = (status?: string) => {
        if (!status) return true;
        const s = status.toLowerCase();
        return !['cancelled', 'delivered', 'complete', 'shipped', 'returned', 'refunded'].includes(s);
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;
        setIsCancelling(true);
        try {
            const res = await authFetch(`/v1/order/cancel/${orderToCancel.id}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || data.detail || "Order cancelled successfully!");
                setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o));
                setOrderToCancel(null);
            } else {
                toast.error(data.message || data.detail || data.error || "Failed to cancel order.");
            }
        } catch (err) {
            toast.error("An error occurred while cancelling order. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="text-blue-600" /> My Orders
                </h1>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-1">Start shopping to see your orders here.</p>
                    <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                            <div
                                className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-bold text-gray-900">{order.order_number}</h3>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                                            (order.status?.toLowerCase() === 'pending') && "bg-yellow-100 text-yellow-700",
                                            (order.status?.toLowerCase() === 'confirmed' || order.status?.toLowerCase() === 'processing') && "bg-blue-100 text-blue-700",
                                            (order.status?.toLowerCase() === 'delivered') && "bg-green-100 text-green-700",
                                            (order.status?.toLowerCase() === 'cancelled') && "bg-red-100 text-red-700",
                                        )}>
                                            {order.status}
                                        </span>

                                        {/* Payment Status Badge */}
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                            (order.payment_status?.toLowerCase() === 'complete' || order.payment_status?.toLowerCase() === 'paid')
                                                ? "bg-green-600 text-white"
                                                : "bg-red-100 text-red-600 border border-red-200"
                                        )}>
                                            {(order.payment_status?.toLowerCase() === 'complete' || order.payment_status?.toLowerCase() === 'paid') ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span>{order.products?.length || 0} items</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 sm:gap-5">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                                        <p className="font-bold text-gray-900 text-lg">৳{order.total_price}</p>
                                    </div>
                                    {canCancelOrder(order.status) && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOrderToCancel(order);
                                            }}
                                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                                        >
                                            <XCircle size={14} />
                                            Cancel
                                        </button>
                                    )}
                                    <button className={clsx(
                                        "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300",
                                        expandedOrder === order.id && "rotate-90 text-blue-600 bg-blue-50"
                                    )}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Order Items Expansion */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-fadeIn">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Items</h4>
                                    <div className="space-y-4">
                                        {order.products?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product?.images?.[0] ? (
                                                            <img
                                                                src={getImageUrl(item.product.images[0])}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product?.name}</p>
                                                        {item.variant && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {item.variant.size && `Size: ${item.variant.size}`}
                                                                {item.variant.size && item.variant.color && ' • '}
                                                                {item.variant.color && `Color: ${item.variant.color}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-medium text-gray-900">৳{item.price}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {canCancelOrder(order.status) && (
                                        <div className="mt-5 pt-4 border-t border-gray-200/70 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-gray-500">Need to cancel this order? You can cancel it before shipment.</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOrderToCancel(order);
                                                }}
                                                className="px-4 py-2 text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-xl transition shadow-sm flex items-center gap-2"
                                            >
                                                <XCircle size={15} /> Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Order Confirmation Modal */}
            {orderToCancel && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => !isCancelling && setOrderToCancel(null)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => setOrderToCancel(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition disabled:opacity-50"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Order?</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Are you sure you want to cancel order <span className="font-semibold text-gray-900">#{orderToCancel.order_number}</span>? This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setOrderToCancel(null)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition text-sm disabled:opacity-50"
                            >
                                No, Keep
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={handleCancelOrder}
                                className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
};

export default OrdersPage;
