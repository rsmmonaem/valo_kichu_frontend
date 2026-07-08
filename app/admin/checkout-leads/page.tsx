"use client";

import React, { useEffect, useState } from 'react';
import { Search, Trash2, CheckCircle, Clock, Smartphone, Mail, MapPin, BarChart2 } from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  payment_method: string;
  notes: string;
  session_token: string;
  converted: boolean;
  order_id: number | null;
  created_at: string;
  updated_at: string;
  cart_data?: Array<{
    product_id: number;
    name: string;
    image: string;
    product_variation_id: number | null;
    variation_snapshot: string | null;
    quantity: number;
    price: number;
  }>;
}

interface Stats {
  total: number;
  converted: number;
  pending: number;
  today: number;
}

const CheckoutLeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "converted">("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `/admin/v1/checkout-leads?page=${page}&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter !== "all") {
        url += `&converted=${statusFilter === "converted"}`;
      }
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
        setLastPage(data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching checkout leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await authFetch('/admin/v1/checkout-leads/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchLeads();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this checkout lead?")) return;

    try {
      const res = await authFetch(`/admin/v1/checkout-leads/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Checkout lead deleted successfully");
        setLeads(leads.filter(lead => lead.id !== id));
        fetchStats();
      }
    } catch (e) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Checkout Leads</h1>
        <button
          onClick={() => { fetchLeads(); fetchStats(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Leads</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.total ?? 0}</p>
          </div>
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <BarChart2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Pending Leads</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.pending ?? 0}</p>
          </div>
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Converted Leads</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats?.converted ?? 0}</p>
          </div>
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Today's Leads</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.today ?? 0}</p>
          </div>
          <div className="p-3 rounded-full bg-purple-50 text-purple-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search leads by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {(["all", "pending", "converted"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPage(1); }}
              className={clsx(
                "flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                statusFilter === filter
                  ? "bg-gray-800 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Lead List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4 w-12">ID</th>
                <th className="p-4">Customer info</th>
                <th className="p-4">Cart items</th>
                <th className="p-4">Delivery address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">Loading leads...</td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500">#{lead.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{lead.name || 'Guest'}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Smartphone size={12} />
                        <span>{lead.phone || 'N/A'}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail size={12} />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.cart_data && lead.cart_data.length > 0 ? (
                        <div className="space-y-1.5 max-w-xs">
                          {lead.cart_data.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100 text-xs">
                              {item.image && (
                                <img
                                  src={
                                    item.image.startsWith("http")
                                      ? item.image
                                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${item.image}`
                                  }
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover shrink-0 border"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-800 truncate" title={item.name}>
                                  {item.name}
                                </p>
                                <div className="flex justify-between items-center text-gray-500 mt-0.5">
                                  <span>Qty: {item.quantity}</span>
                                  <span className="font-medium text-gray-700">৳{item.price}</span>
                                </div>
                                {item.variation_snapshot && (
                                  <span className="text-[10px] text-gray-400 block truncate" title={item.variation_snapshot}>
                                    {item.variation_snapshot}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Empty Cart</span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      {lead.address ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-700 leading-tight">{lead.address}</p>
                            {lead.area && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">{lead.area}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No address given</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1",
                        lead.converted
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}>
                        {lead.converted ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Converted</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            <span>Pending</span>
                          </>
                        )}
                      </span>
                      {lead.order_id && (
                        <div className="text-xs text-gray-500 mt-1 font-medium">
                          Order ID: #{lead.order_id}
                        </div>
                      )}
                    </td>
                    <td className="p-4 capitalize text-gray-700">
                      {lead.payment_method || 'N/A'}
                    </td>
                    <td className="p-4 max-w-xs truncate text-gray-600 italic">
                      {lead.notes || '—'}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(lead.updated_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No checkout leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-600">Page {page} of {lastPage}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutLeadsPage;
