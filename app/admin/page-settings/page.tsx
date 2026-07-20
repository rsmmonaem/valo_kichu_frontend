"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Save, FileText, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const pages = [
  { id: 'about_us', label: 'About Us' },
  { id: 'privacy_policy', label: 'Privacy Policy' },
  { id: 'terms_and_conditions', label: 'Terms & Conditions' },
  { id: 'careers', label: 'Careers' },
  { id: 'help_center', label: 'Help Center' },
  { id: 'returns_and_refunds', label: 'Returns & Refunds' },
  { id: 'shipping_info', label: 'Shipping Info' },
  { id: 'contact_us', label: 'Contact Us' },
];

export default function PageSettings() {
  const [activeTab, setActiveTab] = useState(pages[0].id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const fetchPage = async (pageType: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/v1/pages/${pageType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setTitle(response.data.data.title || '');
        setContent(response.data.data.content || '');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(activeTab);
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/v1/pages/${activeTab}`, {
        title,
        content,
        status: true
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.status === 'success') {
        toast.success('Page updated successfully');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Page Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setActiveTab(page.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === page.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                {page.label}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter page title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content
                </label>
                <div className="bg-white">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="h-64 mb-12"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
