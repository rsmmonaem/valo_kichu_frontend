"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Truck, Package, Clock, CheckCircle, Navigation, Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/api';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const paramOrderId = searchParams.get('orderId') || '';
  const paramPhoneNumber = searchParams.get('phoneNumber') || '';

  const [orderId, setOrderId] = useState(paramOrderId);
  const [phoneNumber, setPhoneNumber] = useState(paramPhoneNumber);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');

  // Auto track if params are provided
  useEffect(() => {
    if (paramOrderId && paramPhoneNumber) {
      const autoTrack = async () => {
        setLoading(true);
        setError('');
        setOrderData(null);
        try {
          const response = await authFetch('/v1/order/track', {
            method: 'POST',
            body: JSON.stringify({
              order_id: paramOrderId,
              phone_number: paramPhoneNumber,
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            setOrderData(data);
          } else {
            setError(data.error || 'Order not found. Please check your details and try again.');
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Order not found or something went wrong.');
        } finally {
          setLoading(false);
        }
      };
      autoTrack();
    }
  }, [paramOrderId, paramPhoneNumber]);

  // Update states if parameters change
  useEffect(() => {
    if (paramOrderId) setOrderId(paramOrderId);
    if (paramPhoneNumber) setPhoneNumber(paramPhoneNumber);
  }, [paramOrderId, paramPhoneNumber]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phoneNumber) {
      setError('Please enter both Order ID and Phone Number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      // POST to our newly created backend endpoint
      const response = await authFetch('/v1/order/track', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setOrderData(data);
      } else {
        setError(data.error || 'Order not found. Please check your details and try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Order not found or something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending':
        return 1;
      case 'confirmed':
      case 'purchased_by_admin':
        return 2;
      case 'ready_to_ship_bd':
        return 3;
      case 'shipping':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
      case 'refunded':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = orderData ? getStatusStep(orderData.db_status || orderData.status) : 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20 px-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Track Order</h1>
        </div>

        {/* Tracking Form */}
        <form onSubmit={handleTrackOrder} className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 max-w-4xl mx-auto">
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Order id"
              className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Your phone number"
              className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Track Order'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 text-red-500 p-4 rounded-lg mb-8 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Initial Empty State */}
        {!orderData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Truck className="w-20 h-20 mb-4 opacity-30 text-gray-400" />
            <p className="text-center text-gray-500">
              Enter your order ID & phone number to get<br />delivery updates
            </p>
          </div>
        )}

        {/* Order Result State */}
        {orderData && (
          <div className="border-t border-gray-100 pt-10">
            <div className="text-center mb-10">
              <h2 className="text-xl font-medium text-gray-800">
                Order Status for <span className="text-orange-500">{orderData.order_number}</span>
              </h2>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-6 left-10 right-10 h-1 bg-gray-100 rounded-full -z-10">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, (currentStep - 1) * 25)}%` }}
                ></div>
              </div>

              {/* Progress Steps */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
                
                {/* Step 1: Order Placed */}
                <div className="flex flex-row md:flex-col items-center text-center w-full md:w-1/5 gap-4 md:gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${currentStep >= 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className={`font-medium text-sm ${currentStep >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>Order Placed</h3>
                    {currentStep >= 1 && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(orderData.created_at)}</p>
                    )}
                  </div>
                </div>

                {/* Step 2: Order Confirmed */}
                <div className="flex flex-row md:flex-col items-center text-center w-full md:w-1/5 gap-4 md:gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${currentStep >= 2 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className={`font-medium text-sm ${currentStep >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Order Confirmed</h3>
                    {currentStep === 2 && orderData.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(orderData.updated_at)}</p>
                    )}
                  </div>
                </div>

                {/* Step 3: Ready to Ship */}
                <div className="flex flex-row md:flex-col items-center text-center w-full md:w-1/5 gap-4 md:gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${currentStep >= 3 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className={`font-medium text-sm ${currentStep >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>Ready to Ship</h3>
                    {currentStep === 3 && orderData.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(orderData.updated_at)}</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Shipping */}
                <div className="flex flex-row md:flex-col items-center text-center w-full md:w-1/5 gap-4 md:gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${currentStep >= 4 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className={`font-medium text-sm ${currentStep >= 4 ? 'text-gray-800' : 'text-gray-400'}`}>Shipping</h3>
                    {currentStep === 4 && orderData.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(orderData.updated_at)}</p>
                    )}
                  </div>
                </div>

                {/* Step 5: Order Delivered */}
                <div className="flex flex-row md:flex-col items-center text-center w-full md:w-1/5 gap-4 md:gap-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${currentStep >= 5 ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className={`font-medium text-sm ${currentStep >= 5 ? 'text-gray-800' : 'text-gray-400'}`}>Order Delivered</h3>
                    {currentStep === 5 && orderData.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">{formatDate(orderData.updated_at)}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Cancelled/Refunded State */}
            {(orderData.status?.toLowerCase() === 'cancelled' || orderData.status?.toLowerCase() === 'refunded') && (
              <div className="mt-10 p-4 bg-red-50 text-red-600 text-center rounded-lg max-w-lg mx-auto border border-red-100 font-medium">
                {orderData.status?.toLowerCase() === 'refunded'
                  ? 'This order has been refunded.'
                  : 'This order has been cancelled.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}

