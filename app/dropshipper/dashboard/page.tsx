"use client";

import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/api';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await authFetch('/dropshipper/stats');
            const data = await res.json();
            if (res.ok) {
                setStatsData(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        {
            name: 'Total Profit',
            value: statsData ? `৳ ${statsData.total_profit?.toLocaleString()}` : '৳ 0.00',
            icon: DollarSign,
            trend: '+0%',
            color: 'bg-green-100 text-green-600'
        },
        {
            name: 'Active Orders',
            value: statsData ? statsData.active_orders?.toString() : '0',
            icon: Package,
            trend: 'Live',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            name: 'Sub Dropshippers',
            value: statsData ? statsData.sub_dropshippers?.toString() : '0',
            icon: Users,
            trend: 'Network',
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            name: 'API Status',
            value: statsData ? statsData.api_usage : 'Active',
            icon: Activity,
            trend: 'Healthy',
            color: 'bg-orange-100 text-orange-600'
        },
    ];

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
                                {stat.trend} {stat.trend.startsWith('+') && <ArrowUpRight size={14} />}
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.name}</h3>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold mb-6">Commission Structure</h3>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        <div className="space-y-8 relative">
                            <div className="flex gap-6">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm relative z-10">1</div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Direct Profit (%)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Earned on every product you sell directly through your platform.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm relative z-10">2</div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Child Commission (%)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Earned on every sale made by your Sub-Dropshippers.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm relative z-10">3</div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Grandchild Commission (%)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Passive income from your network's extended sales chain.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold mb-6">System Health</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">API Gateway</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">ONLINE</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Order Processing</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">STABLE</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Price Calculator</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">SYNCED</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Recent Connection IPs</h4>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-600">192.168.1.45</span>
                                <span className="text-[10px] text-gray-400">2 mins ago</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-600">45.12.89.21</span>
                                <span className="text-[10px] text-gray-400">1 hour ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
