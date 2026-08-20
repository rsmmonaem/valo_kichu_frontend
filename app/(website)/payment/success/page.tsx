"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Home, Loader2, Info } from 'lucide-react';

const PaymentSuccessContent = () => {
    const searchParams = useSearchParams();
    const transactionId = searchParams.get('MerchantTransactionId') || searchParams.get('merchant_transaction_id');
    const status = searchParams.get('Status') || searchParams.get('status');

    React.useEffect(() => {
        if (transactionId) {
            const rawBase = process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com';
            const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;
            fetch(`${apiBase}/v1/payment/verify-eps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchant_transaction_id: transactionId }),
            }).catch(err => console.error('Verification error:', err));
        }
    }, [transactionId]);

    const isPending = status === 'pending';

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50/50">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-green-500/5 text-center max-w-xl w-full border border-gray-100">
                <div className={`w-24 h-24 ${isPending ? 'bg-yellow-50' : 'bg-green-50'} rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500`}>
                    {isPending ? (
                        <Info size={48} className="text-yellow-500" />
                    ) : (
                        <CheckCircle size={48} className="text-green-500" />
                    )}
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                    {isPending ? 'Payment Verification Pending' : 'Payment Successful!'}
                </h1>
                <p className="text-gray-500 mb-8 text-lg">
                    {isPending
                        ? "Your payment was received but is still being verified by the gateway. This usually takes just a few moments."
                        : "Thank you! Your payment has been processed successfully."
                    }
                </p>

                {transactionId && (
                    <div className="space-y-4 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center space-y-2 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</p>
                            <p className="text-lg font-mono font-bold text-gray-900">{transactionId}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
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

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-500" size={48} /></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
