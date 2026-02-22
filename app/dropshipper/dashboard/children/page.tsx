"use client";

import React, { useState, useEffect } from 'react';
import { Users, User as UserIcon, Mail, Phone, Calendar, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/api';

const ChildrenPage = () => {
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await authFetch('/dropshipper/children');
            const data = await res.json();
            if (data.status === 'success') {
                setChildren(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch network', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats Overlay */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">My Network</h2>
                            <p className="text-gray-500 font-medium italic">Manage your sub-dropshippers and team growth</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100/50">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Team Size</p>
                            <p className="text-2xl font-black text-indigo-600">{children.length}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Syncing Team Data...</p>
                    </div>
                ) : children.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Users size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Build Your Network</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">Share your referral link to earn passive commissions from your network's sales.</p>
                        <button className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-95">
                            Get Referral Link
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {children.map((child) => (
                            <div key={child.id} className="bg-gray-50 rounded-3xl p-6 border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm relative overflow-hidden">
                                        {child.image_url ? (
                                            <img src={child.image_url} alt={child.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            child.first_name?.[0] || 'U'
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 truncate max-w-[150px]">{child.first_name} {child.last_name}</h4>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{child.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="truncate">{child.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <Phone size={16} className="text-gray-400" />
                                        <span>{child.phone_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400 pt-3 border-t border-gray-100">
                                        <Calendar size={16} />
                                        <span className="text-xs">Joined {new Date(child.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                                    View Performance <ArrowUpRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChildrenPage;
