import React from 'react';
import axios from 'axios';
import { Briefcase } from 'lucide-react';

async function getPageData() {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/careers`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function CareersPage() {
  const pageData = await getPageData();
  const content = pageData?.data?.content || '<p class="text-gray-500">Careers content coming soon...</p>';
  const title = pageData?.data?.title || 'Careers';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Briefcase className="w-8 h-8 text-purple-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            {title}
          </h1>
          <p className="text-purple-100 text-lg md:text-xl max-w-2xl mx-auto">
            Join our team and help us build the future.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          <div 
            className="prose prose-lg md:prose-xl prose-purple max-w-none text-gray-700 leading-relaxed marker:text-purple-500 prose-headings:text-gray-900 prose-a:text-purple-600 hover:prose-a:text-purple-500"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
