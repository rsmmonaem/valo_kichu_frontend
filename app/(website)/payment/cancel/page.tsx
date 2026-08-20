"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home, Loader2, Package } from 'lucide-react';

const PaymentCancelContent = () => {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('MerchantTransactionId') || searchParams.get('merchant_transaction_id');

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50/50">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-gray-500/5 text-center max-w-xl w-full border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <AlertCircle size={48} className="text-gray-500" />
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Payment Cancelled</h1>
                <p className="text-gray-500 mb-8 text-lg">
                    You have cancelled the payment process. Your order has not been completed.
                </p>

                {transactionId && (
                    <div className="space-y-4 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center space-y-2 shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</p>
                            <p className="text-lg font-mono font-bold text-gray-900">{transactionId}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link href="/checkout" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all">
                        <ArrowLeft size={20} /> Back to Checkout
                    </Link>
                    <Link href="/customer/orders" className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                        <Package size={20} /> My Orders
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function PaymentCancelPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-500" size={48} /></div>}>
            <PaymentCancelContent />
        </Suspense>
    );
}
