import React from 'react';
import { Mail } from 'lucide-react';
import { getPageContent } from '@/lib/api';

export default async function ContactPage() {
  const pageData = await getPageContent('contact_us');
  let content = pageData?.data?.content || '<p class="text-gray-500">Contact Us content coming soon...</p>';
  // Replace non-breaking spaces with normal spaces to fix mobile responsiveness / wrapping
  content = content.replace(/&nbsp;|\u00a0/g, " ");
  const title = pageData?.data?.title || 'Contact Us';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Mail className="w-8 h-8 text-teal-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            {title}
          </h1>
          <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto">
            Get in touch with us for any queries or support.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-6 md:-mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 sm:p-8 md:p-12 border border-gray-100">
          <div 
            className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl prose-teal max-w-none text-gray-700 leading-relaxed marker:text-teal-500 prose-headings:text-gray-900 prose-a:text-teal-600 hover:prose-a:text-teal-500 overflow-x-auto w-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
