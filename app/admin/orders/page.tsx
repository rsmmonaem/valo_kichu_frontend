"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCcw,
  ChevronDown,
  Download,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import clsx from "clsx";
import toast from "react-hot-toast";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminOrdersPage = () => {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type") || "customer"; // Default to customer

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_orders: 0,
    total_sales: 0,
    total_items_qty: 0,
    category_sales: 0,
    category_items_qty: 0,
  });
  const [stats, setStats] = useState<any>({
    all: 0,
    pending: 0,
    confirmed: 0,
    purchased_by_admin: 0,
    ready_to_ship_bd: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  });
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [paymentStatusUpdating, setPaymentStatusUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('adminOrdersPerPage');
    if (saved) {
      setPerPage(Number(saved));
    }
  }, []);

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    localStorage.setItem('adminOrdersPerPage', val.toString());
  };

  const statusTabs = [
    { key: "all", label: "All Orders", color: "gray" },
    { key: "pending", label: "Pending", color: "yellow" },
    { key: "confirmed", label: "Confirmed", color: "blue" },
    { key: "purchased_by_admin", label: "Purchased", color: "indigo" },
    { key: "ready_to_ship_bd", label: "Ready to Ship", color: "purple" },
    { key: "shipping", label: "Shipping", color: "orange" },
    { key: "delivered", label: "Delivered", color: "green" },
    { key: "cancelled", label: "Cancelled", color: "red" },
    { key: "refunded", label: "Refunded", color: "pink" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getOrderRows = () =>
    orders.map((order) => ([
      order.order_number || order.id,
      order.name || order.user?.name || "Guest",
      order.phone || order.contact_number || "",
      new Date(order.created_at).toLocaleDateString(),
      `${order.total_amount || order.total_price}`,
      order.status || "",
      order.payment_status || "unpaid",
    ]));

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const title = typeFilter === "dropshipper" ? "Dropshipper Orders Report" : "Customer Orders Report";
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Order ID", "Name", "Phone", "Date", "Total (৳)", "Status", "Payment"]],
      body: getOrderRows(),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`orders-report-${Date.now()}.pdf`);
    setShowDownloadMenu(false);
  };

  const downloadExcel = () => {
    const headers = ["Order ID", "Name", "Phone", "Date", "Total (BDT)", "Status", "Payment"];
    const rows = getOrderRows();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `orders-report-${Date.now()}.xlsx`);
    setShowDownloadMenu(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await authFetch("/v1/category-list");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchOrders = async (page = currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeStatus !== "all") params.append("status", activeStatus);
      if (typeFilter) params.append("order_type", typeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (selectedCategoryId) params.append("category_id", selectedCategoryId);
      params.append("page", String(page));
      params.append("limit", String(perPage));

      const res = await authFetch(`/admin/v1/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotalOrders(data.total || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      params.append("per_page", "1000");
      if (typeFilter) params.append("order_type", typeFilter);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (selectedCategoryId) params.append("category_id", selectedCategoryId);

      const res = await authFetch(`/admin/v1/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const allOrders = data.data || [];
        const newStats = {
          all: allOrders.length,
          pending: allOrders.filter((o: any) => o.status === "pending").length,
          confirmed: allOrders.filter((o: any) => o.status === "confirmed")
            .length,
          purchased_by_admin: allOrders.filter(
            (o: any) => o.status === "purchased_by_admin"
          ).length,
          ready_to_ship_bd: allOrders.filter(
            (o: any) => o.status === "ready_to_ship_bd"
          ).length,
          shipping: allOrders.filter((o: any) => o.status === "shipping")
            .length,
          delivered: allOrders.filter((o: any) => o.status === "delivered")
            .length,
          cancelled: allOrders.filter((o: any) => o.status === "cancelled")
            .length,
          refunded: allOrders.filter((o: any) => o.status === "refunded")
            .length,
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, typeFilter, startDate, endDate, selectedCategoryId, perPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return;
    setCurrentPage(page);
    fetchOrders(page);
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, startDate, endDate, selectedCategoryId]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    if (
      !window.confirm(`Update order status to ${newStatus.replace(/_/g, " ")}?`)
    )
      return;
    setStatusUpdating(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
        fetchStats();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setStatusUpdating(false);
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    if (
      !window.confirm(`Update payment status to ${newPaymentStatus}?`)
    )
      return;
    setPaymentStatusUpdating(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });

      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
        }
        toast.success("Payment status updated");
      } else {
        toast.error("Failed to update payment status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setPaymentStatusUpdating(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: any = {
      unpaid: "bg-red-105 text-red-700 border-red-200 bg-red-100",
      paid: "bg-green-105 text-green-705 border-green-200 bg-green-100",
      partial: "bg-amber-105 text-amber-705 border-amber-200 bg-amber-100",
    };
    const labels: any = {
      unpaid: "Unpaid",
      paid: "Paid",
      partial: "Partial",
    };
    const key = status ? status.toLowerCase() : "unpaid";
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${styles[key] || "bg-gray-150 text-gray-700"
          }`}
      >
        {labels[key] || key}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "text-green-600 bg-green-100",
      purchased_by_admin: "bg-indigo-100 text-indigo-700",
      ready_to_ship_bd: "bg-purple-100 text-purple-700",
      shipping: "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-pink-100 text-pink-700",
    };
    const labels: any = {
      pending: "Pending",
      confirmed: "Confirmed",
      purchased_by_admin: "Purchased",
      ready_to_ship_bd: "Ready to Ship",
      shipping: "Shipping",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${styles[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {labels[status] || status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {typeFilter === "dropshipper" ? "Dropshipper Orders" : "Customer Orders"} Management
        </h1>

        {/* Download Report Dropdown */}
        <div className="relative" ref={downloadMenuRef}>
          <button
            onClick={() => setShowDownloadMenu((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-sm transition"
          >
            <Download size={15} />
            Download Report
            <ChevronDown size={14} className={clsx("transition-transform", showDownloadMenu && "rotate-180")} />
          </button>
          {showDownloadMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <FileText size={15} className="text-red-500" />
                PDF
              </button>
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition border-t border-gray-100"
              >
                <FileText size={15} className="text-green-600" />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date & Category Filter Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Filter By Date &amp; Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Per Page</label>
            <input
              type="number"
              min="1"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value) || 20)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedCategoryId("");
              }}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats / Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border border-blue-100/85 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-black text-blue-950">{summary.total_orders}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl border border-green-100/85 shadow-sm">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Total Sales</p>
          <p className="text-3xl font-black text-green-950">৳{summary.total_sales}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-xl border border-amber-100/85 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Items Qty Sold</p>
          <p className="text-3xl font-black text-amber-950">{summary.total_items_qty} <span className="text-sm font-semibold text-amber-700">pcs</span></p>
        </div>
        {selectedCategoryId && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-xl border border-purple-100/85 shadow-sm md:col-span-3 lg:col-span-1">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Category Specific Sales</p>
            <p className="text-2xl font-black text-purple-950">৳{summary.category_sales}</p>
            <p className="text-xs text-purple-700 mt-1 font-semibold">Qty Sold: {summary.category_items_qty} pcs</p>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 border-2",
                activeStatus === tab.key
                  ? `bg-${tab.color}-50 text-${tab.color}-700 border-${tab.color}-200`
                  : "bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100"
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  activeStatus === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-800`
                    : "bg-gray-200 text-gray-700"
                )}
              >
                {stats[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4 text-blue-700">{typeFilter === "dropshipper" ? "Dropshipper" : "Customer"}</th>
                {typeFilter === "dropshipper" && (
                  <th className="p-4 text-green-700">Customer</th>
                )}
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={typeFilter === "dropshipper" ? 8 : 7} className="p-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs"
                      >
                        #{order.order_number || order.id}
                      </Link>
                    </td>
                    {/* Dropshipper column */}
                    <td className="p-4">
                      {typeFilter === "dropshipper" ? (
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {`${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim() || order.user?.name || "N/A"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.user?.phone_number || "N/A"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {order.user?.email || ""}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.name || order.user?.name || "Guest"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.phone || order.contact_number}
                          </p>
                        </div>
                      )}
                    </td>
                    {/* Customer column — only for dropshipper view */}
                    {typeFilter === "dropshipper" && (
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">
                            {order.name || "Guest"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.phone || order.contact_number || "N/A"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {order.email || ""}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="p-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      ৳{order.total_amount || order.total_price}
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">
                      <select
                        disabled={paymentStatusUpdating}
                        value={order.payment_status || "unpaid"}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={clsx(
                          "px-2 py-1 rounded text-xs font-semibold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
                          (order.payment_status === "paid") && "bg-green-100 text-green-700 border-green-200",
                          (order.payment_status === "partial") && "bg-amber-100 text-amber-700 border-amber-200",
                          (!order.payment_status || order.payment_status === "unpaid") && "bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        <option value="unpaid" className="bg-white text-red-700 font-semibold">Unpaid</option>
                        <option value="paid" className="bg-white text-green-700 font-semibold">Paid</option>
                        <option value="partial" className="bg-white text-amber-700 font-semibold">Partial</option>
                      </select>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      {/* <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                        title="Quick View"
                      >
                        <Eye size={16} />
                      </button> */}
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-1"
                        title="Order Details"
                      >
                        {/* <FileText size={16} /> */}
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={typeFilter === "dropshipper" ? 8 : 7} className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
              <span className="font-semibold text-gray-700">{lastPage}</span> &mdash;{" "}
              <span className="font-semibold text-gray-700">{totalOrders}</span> total orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                ← Prev
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={clsx(
                        "w-8 h-8 text-sm rounded-lg border font-medium transition",
                        currentPage === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{selectedOrder.order_number || selectedOrder.id}
                </h2>
                {selectedOrder.user?.is_any_dropshipper && (
                  <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">
                    Dropshipper: {selectedOrder.user.store_name}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <XCircle className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  {typeFilter === "dropshipper" ? (
                    <>
                      <div>
                        <h3 className="text-xs uppercase text-blue-600 font-bold mb-2 tracking-wider">
                          Dropshipper Details
                        </h3>
                        <div className="bg-blue-50/50 p-4 rounded-lg space-y-2 text-sm border border-blue-100/50">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {`${selectedOrder.user?.first_name || ""} ${selectedOrder.user?.last_name || ""}`.trim() || selectedOrder.user?.name || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Phone:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.user?.phone_number || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.user?.email || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs uppercase text-green-600 font-bold mb-2 tracking-wider">
                          Customer Details
                        </h3>
                        <div className="bg-green-50/30 p-4 rounded-lg space-y-2 text-sm border border-green-100/30">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.name || "Guest"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Phone:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.phone || selectedOrder.contact_number || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.email || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Address:</span>{" "}
                            <span className="font-medium">
                              {(() => {
                                try {
                                  const addr = JSON.parse(selectedOrder.shipping_address);
                                  return `${addr.address}, ${addr.city}`;
                                } catch {
                                  return selectedOrder.shipping_address || "N/A";
                                }
                              })()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className="text-xs uppercase text-gray-500 font-bold mb-2 tracking-wider">
                        Customer Details
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-150">
                        <p>
                          <span className="text-gray-500">Name:</span>{" "}
                          <span className="font-medium">
                            {selectedOrder.name || selectedOrder.user?.name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Phone:</span>{" "}
                          <span className="font-medium">
                            {selectedOrder.phone || selectedOrder.contact_number}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Email:</span>{" "}
                          <span className="font-medium">
                            {selectedOrder.email ||
                              selectedOrder.user?.email ||
                              "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Address:</span>{" "}
                          <span className="font-medium">
                            {(() => {
                              try {
                                const addr = JSON.parse(selectedOrder.shipping_address);
                                return `${addr.address}, ${addr.city}`;
                              } catch {
                                return selectedOrder.shipping_address || "N/A";
                              }
                            })()}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">
                      Order Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "pending",
                        "confirmed",
                        "processing",
                        "shipping",
                        "delivered",
                        "cancelled",
                      ].map((s) => (
                        <button
                          key={s}
                          disabled={statusUpdating}
                          onClick={() => updateStatus(selectedOrder.id, s)}
                          className={clsx(
                            "px-3 py-1.5 text-xs rounded border font-medium transition-colors capitalize",
                            selectedOrder.status === s
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">
                      Payment Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "unpaid", label: "Unpaid" },
                        { key: "paid", label: "Paid" },
                        { key: "partial", label: "Partial" },
                      ].map((p) => (
                        <button
                          key={p.key}
                          disabled={paymentStatusUpdating}
                          onClick={() => updatePaymentStatus(selectedOrder.id, p.key)}
                          className={clsx(
                            "px-3 py-1.5 text-xs rounded border font-medium transition-colors uppercase tracking-wider",
                            (selectedOrder.payment_status || "unpaid") === p.key
                              ? p.key === "paid"
                                ? "bg-green-600 text-white border-green-600 shadow-md"
                                : p.key === "partial"
                                  ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                  : "bg-red-600 text-white border-red-600 shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">
                Order Items
              </h3>
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product?.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                  No img
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.product_name ||
                                  item.product?.name ||
                                  "Product"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.variation_snapshot || item.variant_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right font-medium">
                          ৳{item.total || item.total_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ৳{selectedOrder.total_amount || selectedOrder.total_price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      ৳{selectedOrder.shipping_cost || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span className="text-gray-800">Total</span>
                    <span className="text-blue-600">
                      ৳
                      {parseFloat(
                        selectedOrder.total_amount || selectedOrder.total_price
                      ) + parseFloat(selectedOrder.shipping_cost || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
