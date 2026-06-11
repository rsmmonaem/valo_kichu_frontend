"use client";

import React, { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCcw,
  CreditCard,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import clsx from "clsx";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const OrderDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched order details:", data);
        setOrder(data);
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (
      !window.confirm(`Update order status to ${newStatus.replace(/_/g, " ")}?`)
    )
      return;
    setStatusUpdating(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Status updated");
        fetchOrderDetails();
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

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-green-100 text-green-600",
      purchased_by_admin: "bg-indigo-100 text-indigo-700",
      ready_to_ship_bd: "bg-purple-100 text-purple-700",
      shipping: "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-pink-100 text-pink-700",
    };
    return (
      <span
        className={clsx(
          "px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider",
          styles[status] || "bg-gray-100 text-gray-700"
        )}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const shippingAddress = (() => {
    try {
      const addr = JSON.parse(order.shipping_address);
      return addr;
    } catch {
      return null;
    }
  })();

  // Calculate DRP totals
  const drpSubtotal = order.items?.reduce(
    (sum: number, item: any) => sum + (item.order_price || 0) * item.quantity,
    0
  ) || 0;

  const drpTotal = drpSubtotal + parseFloat(order.shipping_cost || 0);

  // Calculate MRP totals (original prices)
  const mrpSubtotal = parseFloat(order.total_amount || order.subtotal || 0);
  const mrpTotal = mrpSubtotal + parseFloat(order.shipping_cost || 0);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Link href="/admin/orders" className="hover:text-blue-600">
              Orders
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">
              #{order.order_number || order.id}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.order_number || order.id}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
          {/* Print Button? */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items and Status Update */}
        <div className="lg:col-span-2 space-y-8">

          {/* ── Dropshipping: Dropshipper + Customer info cards ── */}
          {order.order_type === "dropshipping" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Dropshipper Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-blue-100 bg-blue-50/40">
                  <h2 className="font-bold text-sm flex items-center gap-2 text-blue-700 uppercase tracking-wider">
                    <User size={16} />
                    Dropshipper
                  </h2>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Name</p>
                      <p className="font-bold text-gray-900">
                        {`${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim() || order.user?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Phone</p>
                      <p className="font-bold text-gray-900">{order.user?.phone_number || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Email</p>
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">{order.user?.email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-green-100 bg-green-50/40">
                  <h2 className="font-bold text-sm flex items-center gap-2 text-green-700 uppercase tracking-wider">
                    <User size={16} />
                    Customer
                  </h2>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Name</p>
                      <p className="font-bold text-gray-900">{order.name || "Guest"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Phone</p>
                      <p className="font-bold text-gray-900">{order.phone || order.contact_number || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase font-bold tracking-widest">Email</p>
                      <p className="font-bold text-gray-900">{order.email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Order Items
              </h2>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
                {order.items?.length || 0} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center w-40">Price</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                              {item.product_name || item.product?.name}
                            </p>
                            <div>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.variation_snapshot ||
                                  item.variant_name ||
                                  "No variation"}
                              </p>
                              <p>
                                {item.product.product_code ? (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                    Code: {item.product.product_code}
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                    SKU not available
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        <div className="text-sm leading-tight">
                          <div>MRP: ৳{item.price || item.unit_price}</div>
                          <div className="font-semibold text-green-600 mt-1">
                            DRP: ৳{item.order_price || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold ">

                        <div className="text-sm leading-tight">
                          <div>৳{item.total || item.total_price}</div>
                          <div className="font-semibold text-green-600 mt-1">
                            ৳{(item.order_price * item.quantity || 0).toFixed(2)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Summary with Left (DRP) and Right (MRP) Columns */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <div className="max-w-xs ml-auto grid grid-cols-2 gap-6">
                {/* Left Column - DRP Summary */}
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2 text-center">
                    DRP Calculation
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">৳{drpSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold">৳{parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">
                      ৳{drpTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right Column - MRP Summary (Original Prices) */}
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2 text-center">
                    MRP Calculation
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">৳{mrpSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold">৳{parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ৳{mrpTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <RefreshCcw size={20} className="text-orange-600" />
              Update Order Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                "pending",
                "confirmed",
                "purchased_by_admin",
                "ready_to_ship_bd",
                "shipping",
                "delivered",
                "cancelled",
                "refunded",
              ].map((s) => (
                <button
                  key={s}
                  disabled={statusUpdating}
                  onClick={() => updateStatus(s)}
                  className={clsx(
                    "px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all capitalize",
                    order.status === s
                      ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200"
                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                  )}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-8">
          {/* Dropshipper Info (if dropshipping order) */}
          {order.order_type === "dropshipping" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-blue-50/10">
                <h2 className="font-bold text-lg flex items-center gap-2 text-blue-700">
                  <User size={20} />
                  Dropshipper Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                      Store / Full Name
                    </p>
                    <p className="font-bold text-gray-900">
                      {`${order.user?.first_name || ""} ${order.user?.last_name || ""}`.trim() || order.user?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                      Phone Number
                    </p>
                    <p className="font-bold text-gray-900">
                      {order.user?.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                      Email Address
                    </p>
                    <p className="font-bold text-gray-900 truncate max-w-[180px]">
                      {order.user?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Customer Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                    Full Name
                  </p>
                  <p className="font-bold text-gray-900">
                    {order.name || order.user?.name || "Guest"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                    Phone Number
                  </p>
                  <p className="font-bold text-gray-900">
                    {order.phone || order.contact_number || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">
                    Email Address
                  </p>
                  <p className="font-bold text-gray-900 truncate max-w-[180px]">
                    {order.email || order.user?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MapPin size={20} className="text-red-600" />
                Shipping Details
              </h2>
            </div>
            <div className="p-6">
              {shippingAddress ? (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="font-bold text-gray-900 mb-2">
                    {shippingAddress.name || order.name || order.user?.name}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {shippingAddress.address}
                    <br />
                    {shippingAddress.city}{" "}
                    {shippingAddress.area ? `- ${shippingAddress.area}` : ""}
                    <br />
                    Phone:{" "}
                    {shippingAddress.phone ||
                      order.phone ||
                      order.contact_number}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {order.shipping_address || "No shipping address provided"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600" />
                Payment & Shipping
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  Payment Method:
                </span>
                <span className="font-bold text-gray-900 uppercase">
                  {order.payment_method || "COD"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">
                  Shipping Method:
                </span>
                <span className="font-bold text-gray-900">
                  {order.shipping_method || "Standard"}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Tracking ID:</span>
                <span className="font-bold text-blue-600 font-mono italic">
                  {order.tracking_id || "Not assigned"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;