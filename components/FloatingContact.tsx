"use client";
import React from 'react';
import Link from 'next/link';
import { PhoneCall } from 'lucide-react';
import * as fpixel from '@/lib/fpixel';

export default function FloatingContact() {
    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-4">
            {/* Track Order Floating Icon */}
            <Link
                href="/track-order"
                className="group relative w-12 h-12 md:w-14 md:h-14 bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center cursor-pointer border border-gray-100"
                aria-label="Track Your Order"
                title="Track your order"
                prefetch={false}
            >
                <img
                    src="/tracking.png"
                    alt="Track Your Order"
                    className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                {/* Tooltip bubble */}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md">
                    Track your order
                    {/* Tooltip arrow */}
                    <span className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-gray-900"></span>
                </span>
            </Link>

            {/* WhatsApp Floating Icon */}
            <Link
                href="https://wa.me/+8801410643138"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => fpixel.event('Contact', { method: 'WhatsApp Floating' })}
                className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-[#25D366]/40 hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
                aria-label="Chat on WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zM223.9 414.7c-32.9 0-65.1-8.8-93.3-25.5l-6.7-4-69.4 18.2 18.5-67.6-4.4-7C50.2 297.8 41.2 261 41.2 223.9c0-100.5 81.8-182.3 182.7-182.3 48.7 0 94.5 19 128.9 53.4 34.4 34.4 53.4 80.2 53.4 128.9 0 100.5-81.8 182.3-182.7 182.3zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.5-4.3 .9-4.3 3.6-9.8 1.4-2.8 2.8-5.6 1.4-8.3-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.7 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
            </Link>
        </div>
    );
}
