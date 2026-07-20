import React from 'react';
import axios from 'axios';
import { Truck } from 'lucide-react';

async function getPageData() {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/shipping_info`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function ShippingPage() {
  const pageData = await getPageData();
  const content = pageData?.data?.content || '<p class="text-gray-500">Shipping Info content coming soon...</p>';
  const title = pageData?.data?.title || 'Shipping Info';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Truck className="w-8 h-8 text-rose-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            {title}
          </h1>
          <p className="text-rose-100 text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need to know about our shipping and delivery.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          <div 
            className="prose prose-lg md:prose-xl prose-rose max-w-none text-gray-700 leading-relaxed marker:text-rose-500 prose-headings:text-gray-900 prose-a:text-rose-600 hover:prose-a:text-rose-500"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
