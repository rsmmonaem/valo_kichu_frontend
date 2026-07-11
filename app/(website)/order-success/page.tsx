"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home, Download, Mail, Send, Loader2, Truck, Phone } from 'lucide-react';
import { sendOrderInvoice, getOrderSuccessDetails } from '@/lib/api';


const OrderSuccessContent = () => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        const fetchDetails = async () => {
            setLoadingDetails(true);
            try {
                const res = await getOrderSuccessDetails(orderId);
                if (res.status) {
                    setOrderDetails(res.data);
                }
            } catch (err) {
                console.error("Failed to load order details", err);
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [orderId]);


    const handleDownload = () => {
        if (!orderId) return;
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
        window.open(`${baseUrl}/api/v1/invoice/${orderId}`, '_blank');
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !email) return;

        setIsSending(true);
        setMessage(null);

        try {
            const result = await sendOrderInvoice(orderId, email);
            if (result.status) {
                setMessage({ text: 'Invoice has been sent to your email successfully!', type: 'success' });
                setEmailSent(true);
            } else {
                setMessage({ text: result.message || 'Failed to send invoice.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50/50">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-green-500/5 text-center max-w-xl w-full border border-gray-100">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <CheckCircle size={48} className="text-green-500" />
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8 text-lg">
                    Thank you for your purchase. We've received your order and we're getting it ready for you.
                </p>

                {(orderId || orderDetails) && (
                    <div className="space-y-4 mb-8">
                        <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50 text-left space-y-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-green-100/80 pb-3 gap-2">
                                <div>
                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Order ID</p>
                                    <p className="text-xl font-mono font-bold text-gray-900">#{orderId}</p>
                                </div>
                                {orderDetails?.order_number && (
                                    <div className="sm:text-right">
                                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Order Number</p>
                                        <p className="text-lg font-mono font-bold text-gray-900">{orderDetails.order_number}</p>
                                    </div>
                                )}
                            </div>
                            {orderDetails?.contact_number && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone size={18} className="text-green-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Billing Phone</p>
                                        <p className="text-base font-bold font-mono text-gray-900">{orderDetails.contact_number}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Track Order Card */}
                        {orderDetails && (
                            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/60 text-left shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-100/70 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                                        <Truck size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">Track Your Order</h3>
                                        <p className="text-sm text-gray-600 mt-1 mb-4">
                                            You can track your order status in real-time using your Order ID/Number and Phone Number.
                                        </p>
                                        <Link
                                            href={`/track-order?orderId=${orderDetails.order_number || orderId}&phoneNumber=${orderDetails.contact_number}`}
                                            className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 active:scale-95 text-sm"
                                        >
                                            <Truck size={16} /> Track Order Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Invoice Preview */}
                {orderId && (
                    <div className="mt-10 mb-8 overflow-hidden rounded-2xl border border-gray-100 shadow-inner bg-gray-50 flex flex-col">
                        <div className="bg-gray-100/50 p-4 border-bottom border-gray-100 text-left">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Package size={16} /> Invoice Preview
                            </h3>
                        </div>
                        <div className="h-[500px] w-full bg-white relative">
                            <iframe
                                src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '')}/api/v1/invoice/${orderId}/preview`}
                                className="w-full h-full border-0"
                                title="Invoice Preview"
                            />
                        </div>
                        <div className="p-6 bg-white border-t border-gray-100">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                                <Download size={20} /> Download PDF Invoice
                            </button>
                        </div>
                    </div>
                )}

                {/* Other Actions */}
                <div className="space-y-6 mb-10 text-left">
                    <div className="p-1 px-1">
                        {!emailSent && (
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                    <Mail size={16} /> Want the invoice in your inbox?
                                </p>
                                <form onSubmit={handleSendEmail} className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                                    >
                                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </form>
                                {message && (
                                    <p className={`mt-3 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {message.text}
                                    </p>
                                )}
                            </div>
                        )}

                        {emailSent && (
                            <div className="bg-green-50 text-green-700 p-5 rounded-2xl border border-green-100 flex items-center gap-3">
                                <CheckCircle size={20} />
                                <p className="text-sm font-semibold">{message?.text}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/customer/orders" className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-all">
                        <Package size={20} /> My Orders
                    </Link>
                    <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                        <Home size={20} /> Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-500" size={48} /></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
