"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Wallet, 
  Receipt, 
  History, 
  TrendingUp, 
  AlertCircle,
  Download,
  Calendar,
  ExternalLink,
  RefreshCw,
  User,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import clsx from "clsx";

const DropshipperDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, [id]);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${id}/wallet`);
      const result = await res.json();
      if (res.ok) {
        setData(result.data);
      } else {
        alert(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await authFetch(`/admin/v1/dropshipping/users/${id}/due-invoice`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `due-invoice-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const result = await res.json();
        alert(result.message || "No due orders found to generate invoice");
      }
    } catch (err) {
      alert("Failed to download invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <RefreshCw size={48} className="text-blue-600 animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">Loading partner data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center">
        <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-2xl font-black">Partner not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                {data.user.name}
              </h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">
                {data.user.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
              <User size={16} /> {data.user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadInvoice}
            className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <Receipt size={20} /> Generate Due Invoice
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
          <TrendingUp className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Wallet size={24} />
              </div>
              <span className="font-bold text-emerald-50 opacity-90 uppercase tracking-widest text-xs">Profit Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">৳{data.stats.total_profit?.toLocaleString()}</span>
              <span className="text-emerald-100 font-bold text-xs">BDT</span>
            </div>
            <p className="text-[10px] text-emerald-100/60 font-bold uppercase mt-2">Available to withdraw</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[40px] p-8 text-white shadow-2xl shadow-red-200 relative overflow-hidden group">
          <AlertCircle className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Receipt size={24} />
              </div>
              <span className="font-bold text-red-50 opacity-90 uppercase tracking-widest text-xs">Due Amount</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter">৳{data.stats.due_amount?.toLocaleString()}</span>
              <span className="text-red-100 font-bold text-xs">BDT</span>
            </div>
            <p className="text-[10px] text-red-100/60 font-bold uppercase mt-2">Owed for online orders</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group">
          <RefreshCw className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-5 text-blue-600 group-hover:rotate-90 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Package size={24} />
              </div>
              <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Active Orders</span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">{data.stats.active_orders || 0}</span>
              <span className="text-gray-400 font-bold text-xs uppercase">Live</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group">
          <User className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Users size={24} />
              </div>
              <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Sub Partners</span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">{data.stats.sub_dropshippers || 0}</span>
              <span className="text-gray-400 font-bold text-xs uppercase">Network</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earned</p>
            <p className="text-2xl font-black text-gray-800 tracking-tighter">৳{data.stats.total_earned?.toLocaleString()}</p>
          </div>
          <TrendingUp className="text-emerald-500" size={24} />
        </div>
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Withdrawn</p>
            <p className="text-2xl font-black text-gray-800 tracking-tighter">৳{data.stats.total_withdrawn?.toLocaleString()}</p>
          </div>
          <ArrowUpRight className="text-red-400" size={24} />
        </div>
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Refer Code</p>
            <p className="text-2xl font-black text-gray-800 tracking-tighter">{data.user.refer_code || 'N/A'}</p>
          </div>
          <ExternalLink className="text-indigo-400" size={20} />
        </div>
      </div>


      {/* Transactions Section */}
      <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Transaction History</h3>
              <p className="text-gray-500 text-sm font-medium">All financial movements for this account.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6 text-center">Type</th>
                <th className="px-10 py-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Receipt size={64} className="mb-4" />
                      <p className="text-xl font-black uppercase tracking-tighter">No transactions recorded</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.transactions.map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-300" />
                        <span className="font-bold text-gray-600 text-sm">
                          {new Date(t.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="font-black text-gray-800 text-base">{t.description}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">{t.source}</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={clsx(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm inline-flex items-center gap-1.5",
                        t.type === 'credit' 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      )}>
                        {t.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className={clsx(
                        "text-xl font-black tracking-tight",
                        t.type === 'credit' ? "text-emerald-600" : "text-red-600"
                      )}>
                        {t.type === 'credit' ? '+' : '-'} ৳{parseFloat(t.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DropshipperDetailPage;
