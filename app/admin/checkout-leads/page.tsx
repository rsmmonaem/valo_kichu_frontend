"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Trash2, CheckCircle, Clock, Smartphone, Mail, MapPin,
  BarChart2, Eye, X, ShoppingBag, Download, RefreshCw, ChevronDown,
  FileSpreadsheet, Loader2, Calendar
} from 'lucide-react';
import { authFetch } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import Link from 'next/link';

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [converting, setConverting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConvertToOrder = async (leadId: number) => {
    if (!window.confirm("Are you sure you want to convert this lead to a pending order?")) return;

    setConverting(true);
    try {
      const res = await authFetch(`/admin/v1/checkout-leads/${leadId}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        toast.success(data.message || "Lead converted to order successfully!");

        // Update leads list in state
        setLeads(prevLeads => prevLeads.map(lead => {
          if (lead.id === leadId) {
            return { ...lead, converted: true, order_id: data.order_id };
          }
          return lead;
        }));

        // Update currently selected lead modal details
        setSelectedLead(prevSelected => {
          if (prevSelected && prevSelected.id === leadId) {
            return { ...prevSelected, converted: true, order_id: data.order_id };
          }
          return prevSelected;
        });

        fetchStats();
      } else {
        toast.error(data.message || "Failed to convert lead to order");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during conversion");
    } finally {
      setConverting(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `/admin/v1/checkout-leads?page=${page}&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter !== "all") {
        url += `&converted=${statusFilter === "converted"}`;
      }
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
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
  }, [page, statusFilter, startDate, endDate]);

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

  // Export CSV Handler (Streams from backend with full client fallback)
  const handleExportCsv = async (mode: 'all' | 'filtered') => {
    setExporting(true);
    setShowExportMenu(false);
    const toastId = toast.loading("Generating CSV export...");
    try {
      let url = `/admin/v1/checkout-leads/export`;
      if (mode === 'filtered') {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('converted', String(statusFilter === 'converted'));
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const queryStr = params.toString();
        if (queryStr) url += `?${queryStr}`;
      }

      const res = await authFetch(url, {
        headers: {
          'Accept': 'text/csv, application/json',
        },
      });

      if (!res.ok) {
        throw new Error("Server CSV export failed, trying client fallback...");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `checkout-leads-${mode === 'filtered' ? 'filtered-' : 'all-'}${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("CSV export downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.warn("Direct CSV download error, falling back to client-side generation:", err);
      try {
        let fetchUrl = `/admin/v1/checkout-leads?per_page=10000`;
        if (mode === 'filtered') {
          if (searchTerm) fetchUrl += `&search=${encodeURIComponent(searchTerm)}`;
          if (statusFilter !== 'all') fetchUrl += `&converted=${statusFilter === 'converted'}`;
          if (startDate) fetchUrl += `&start_date=${startDate}`;
          if (endDate) fetchUrl += `&end_date=${endDate}`;
        }
        const fallbackRes = await authFetch(fetchUrl);
        if (!fallbackRes.ok) throw new Error("Could not fetch leads for CSV export");
        const json = await fallbackRes.json();
        const exportItems: Lead[] = json.data || [];

        if (exportItems.length === 0) {
          toast.error("No leads available to export", { id: toastId });
          return;
        }

        const escapeCsv = (str: any) => {
          if (str === null || str === undefined) return '""';
          const s = String(str).replace(/"/g, '""');
          return `"${s}"`;
        };

        const headers = [
          "Lead ID", "Customer Name", "Phone", "Email", "Delivery Address", "Area",
          "Status", "Linked Order ID", "Payment Method", "Cart Total (BDT)",
          "Total Items Qty", "Cart Products", "Customer Notes", "Created At", "Updated At"
        ];

        const rows = exportItems.map((item) => {
          let total = 0;
          let qty = 0;
          const prods: string[] = [];
          if (Array.isArray(item.cart_data)) {
            item.cart_data.forEach((p) => {
              const itemQty = p.quantity || 1;
              const itemPrice = p.price || 0;
              total += itemQty * itemPrice;
              qty += itemQty;
              const variant = p.variation_snapshot ? ` (${p.variation_snapshot})` : "";
              prods.push(`${p.name || 'Item'}${variant} x${itemQty} (৳${itemPrice})`);
            });
          }

          return [
            escapeCsv(item.id),
            escapeCsv(item.name || "Guest"),
            escapeCsv(item.phone || ""),
            escapeCsv(item.email || ""),
            escapeCsv(item.address || ""),
            escapeCsv(item.area || ""),
            escapeCsv(item.converted ? "Converted" : "Pending"),
            escapeCsv(item.order_id ? `#${item.order_id}` : ""),
            escapeCsv(item.payment_method || ""),
            escapeCsv(total),
            escapeCsv(qty),
            escapeCsv(prods.join("; ")),
            escapeCsv(item.notes || ""),
            escapeCsv(item.created_at ? new Date(item.created_at).toLocaleString() : ""),
            escapeCsv(item.updated_at ? new Date(item.updated_at).toLocaleString() : "")
          ].join(",");
        });

        const csvString = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `checkout-leads-${mode === 'filtered' ? 'filtered-' : 'all-'}${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("CSV export downloaded successfully!", { id: toastId });
      } catch (fallbackErr: any) {
        toast.error(fallbackErr.message || "Failed to export CSV", { id: toastId });
      }
    } finally {
      setExporting(false);
    }
  };

  // Export Excel (.xlsx) Handler
  const handleExportExcel = async (mode: 'all' | 'filtered') => {
    setExporting(true);
    setShowExportMenu(false);
    const toastId = toast.loading("Generating Excel export...");
    try {
      let url = `/admin/v1/checkout-leads?per_page=10000`;
      if (mode === 'filtered') {
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        if (statusFilter !== 'all') url += `&converted=${statusFilter === 'converted'}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
      }

      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch leads for Excel export");
      const json = await res.json();
      const exportItems: Lead[] = json.data || [];

      if (exportItems.length === 0) {
        toast.error("No leads available to export", { id: toastId });
        return;
      }

      const headers = [
        "Lead ID", "Customer Name", "Phone", "Email", "Delivery Address", "Area",
        "Status", "Linked Order ID", "Payment Method", "Cart Total (BDT)",
        "Total Items Qty", "Cart Products", "Customer Notes", "Created At", "Updated At"
      ];

      const rows = exportItems.map((item) => {
        let total = 0;
        let qty = 0;
        const prods: string[] = [];
        if (Array.isArray(item.cart_data)) {
          item.cart_data.forEach((p) => {
            const itemQty = p.quantity || 1;
            const itemPrice = p.price || 0;
            total += itemQty * itemPrice;
            qty += itemQty;
            const variant = p.variation_snapshot ? ` (${p.variation_snapshot})` : "";
            prods.push(`${p.name || 'Item'}${variant} x${itemQty} (৳${itemPrice})`);
          });
        }

        return [
          item.id,
          item.name || "Guest",
          item.phone || "",
          item.email || "",
          item.address || "",
          item.area || "",
          item.converted ? "Converted" : "Pending",
          item.order_id ? `#${item.order_id}` : "",
          item.payment_method || "",
          total,
          qty,
          prods.join("; "),
          item.notes || "",
          item.created_at ? new Date(item.created_at).toLocaleString() : "",
          item.updated_at ? new Date(item.updated_at).toLocaleString() : ""
        ];
      });

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet["!cols"] = [
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 35 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 45 }, { wch: 25 }, { wch: 20 }, { wch: 20 }
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Checkout Leads");
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `checkout-leads-${mode === 'filtered' ? 'filtered-' : 'all-'}${dateStr}.xlsx`);
      toast.success("Excel export downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Excel export error:", err);
      toast.error(err.message || "Failed to export Excel", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Checkout Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and export customer cart checkout leads</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Export CSV Split Button */}
          <div className="relative" ref={exportMenuRef}>
            <div className="inline-flex rounded-lg shadow-xs overflow-hidden">
              <button
                onClick={() => handleExportCsv('filtered')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition text-sm font-semibold disabled:opacity-50 cursor-pointer"
                title="Quick export matching current filters as CSV"
              >
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Export CSV</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={exporting}
                className="px-2.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white transition text-sm border-l border-emerald-500 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                title="More export options"
              >
                <ChevronDown size={15} className={clsx("transition-transform", showExportMenu && "rotate-180")} />
              </button>
            </div>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  CSV Format (.csv)
                </div>
                <button
                  onClick={() => handleExportCsv('filtered')}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/60 flex flex-col transition cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    Export Filtered Leads (CSV)
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 pl-6">
                    Matches active search & filters
                  </span>
                </button>
                <button
                  onClick={() => handleExportCsv('all')}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/60 flex flex-col transition cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Download size={15} className="text-emerald-600" />
                    Export All Leads (CSV)
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 pl-6">
                    All {stats?.total ? `${stats.total} ` : ''}leads in database
                  </span>
                </button>

                <div className="my-1 border-t border-gray-100"></div>

                <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Excel Format (.xlsx)
                </div>
                <button
                  onClick={() => handleExportExcel('filtered')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-sm font-medium text-gray-700 transition cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-blue-600" />
                  Export Filtered as Excel
                </button>
                <button
                  onClick={() => handleExportExcel('all')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-sm font-medium text-gray-700 transition cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-blue-600" />
                  Export All as Excel
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => { fetchLeads(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-semibold cursor-pointer shadow-xs"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                title="Start Date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer"
              />
            </div>
            <span className="text-gray-400 text-xs font-medium">to</span>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                title="End Date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-gray-700 focus:outline-none cursor-pointer"
              />
            </div>

            {(searchTerm || startDate || endDate || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium cursor-pointer"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 w-full xl:w-auto">
          {(["all", "pending", "converted"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setPage(1); }}
              className={clsx(
                "flex-1 xl:flex-initial px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer",
                statusFilter === filter
                  ? "bg-gray-800 text-white shadow-xs"
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
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading leads...</td></tr>
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
                          Order ID:{" "}
                          <Link href={`/admin/orders/${lead.order_id}`} className="text-blue-600 hover:underline font-semibold">
                            #{lead.order_id}
                          </Link>
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
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Lead Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No checkout leads found.</td></tr>
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                <p className="text-sm text-gray-500 mt-1">Lead ID: #{selectedLead.id}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-xs text-gray-505">Name</p>
                      <p className="font-semibold text-gray-900">{selectedLead.name || 'Guest'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-505">Phone</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <Smartphone size={14} className="text-gray-400" />
                        {selectedLead.phone || 'N/A'}
                      </p>
                    </div>
                    {selectedLead.email && (
                      <div>
                        <p className="text-xs text-gray-505">Email</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                          <Mail size={14} className="text-gray-400" />
                          {selectedLead.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery & Status Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Delivery & Payment</h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-xs text-gray-505">Shipping Address</p>
                      <p className="font-semibold text-gray-900 flex items-start gap-1.5 mt-0.5">
                        <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                        <span>
                          {selectedLead.address || 'N/A'}
                          {selectedLead.area && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium inline-block">
                              {selectedLead.area}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-505">Payment Method</p>
                        <p className="font-semibold text-gray-900 capitalize mt-0.5">{selectedLead.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-505">Status</p>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 mt-1",
                          selectedLead.converted
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        )}>
                          {selectedLead.converted ? 'Converted' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    {selectedLead.order_id && (
                      <div>
                        <p className="text-xs text-gray-505">Linked Order ID</p>
                        <Link
                          href={`/admin/orders/${selectedLead.order_id}`}
                          className="font-bold text-green-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          #{selectedLead.order_id}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Order Notes</h3>
                  <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl text-gray-700 italic">
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              {/* Cart Products List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Cart Products</h3>
                {selectedLead.cart_data && selectedLead.cart_data.length > 0 ? (
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedLead.cart_data.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={
                                      item.image.startsWith("http")
                                        ? item.image
                                        : `${process.env.NEXT_PUBLIC_API_URL || "https://backend.valokichu.com"}/${item.image}`
                                    }
                                    alt={item.name}
                                    className="w-10 h-10 rounded object-cover border"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate max-w-xs">{item.name}</p>
                                  {item.variation_snapshot && (
                                    <span className="text-xs text-gray-505">{item.variation_snapshot}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center text-gray-700 font-medium">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-700">৳{item.price}</td>
                            <td className="p-3 text-right text-gray-900 font-semibold">৳{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50/50 border-t border-gray-100">
                        <tr>
                          <td colSpan={3} className="p-3 font-semibold text-gray-700 text-right">Subtotal:</td>
                          <td className="p-3 font-bold text-gray-950 text-right">
                            ৳{selectedLead.cart_data.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl italic">
                    No products in the cart for this lead.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              {!selectedLead.converted && (
                <button
                  disabled={converting}
                  onClick={() => handleConvertToOrder(selectedLead.id)}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition text-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ShoppingBag size={16} />
                  {converting ? "Converting..." : "Make Order"}
                </button>
              )}
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition text-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutLeadsPage;
