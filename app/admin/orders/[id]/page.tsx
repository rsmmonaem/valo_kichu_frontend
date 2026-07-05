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
  Edit,
  Trash2,
  Save,
  Plus,
  Search,
  Minus,
  X,
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
  const [paymentStatusUpdating, setPaymentStatusUpdating] = useState(false);

  // Order Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<any>(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [shippingAddressEdit, setShippingAddressEdit] = useState<any>({
    name: "",
    address: "",
    city: "",
    area: "",
    phone: ""
  });
  const [isAddressJson, setIsAddressJson] = useState(false);

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

  const handleStartEdit = () => {
    setEditedOrder({
      ...order,
      items: order.items.map((item: any) => ({ ...item })),
    });

    try {
      const parsed = JSON.parse(order.shipping_address);
      if (parsed && typeof parsed === 'object') {
        setShippingAddressEdit({
          name: parsed.name || "",
          address: parsed.address || "",
          city: parsed.city || "",
          area: parsed.area || "",
          phone: parsed.phone || ""
        });
        setIsAddressJson(true);
      } else {
        setShippingAddressEdit({
          name: "",
          address: order.shipping_address || "",
          city: "",
          area: "",
          phone: ""
        });
        setIsAddressJson(false);
      }
    } catch {
      setShippingAddressEdit({
        name: "",
        address: order.shipping_address || "",
        city: "",
        area: "",
        phone: ""
      });
      setIsAddressJson(false);
    }

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedOrder(null);
    setProductSearch("");
    setSearchResults([]);
  };

  const handleSaveChanges = async () => {
    if (!editedOrder.items || editedOrder.items.length === 0) {
      toast.error("An order must have at least one product.");
      return;
    }

    setSavingOrder(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedOrder.name,
          email: editedOrder.email,
          contact_number: editedOrder.contact_number,
          shipping_address: editedOrder.shipping_address,
          shipping_cost: parseFloat(editedOrder.shipping_cost) || 0,
          discount: parseFloat(editedOrder.discount) || 0,
          notes: editedOrder.notes,
          items: editedOrder.items.map((item: any) => ({
            product_id: item.product_id,
            product_variation_id: (item.product_variation_id || item.variant_id) ? parseInt(item.product_variation_id || item.variant_id) || null : null,
            quantity: parseInt(item.quantity) || 1,
            unit_price: parseFloat(item.unit_price || item.price) || 0,
            order_price: parseFloat(item.order_price || item.unit_price || item.price) || 0,
            product_name: item.product_name,
            variation_snapshot: item.variation_snapshot
          }))
        }),
      });

      if (res.ok) {
        toast.success("Order updated successfully!");
        setIsEditing(false);
        setEditedOrder(null);
        fetchOrderDetails();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleAddProductToOrder = (product: any) => {
    const selectEl = document.getElementById(`var-select-${product.id}`) as HTMLSelectElement | null;
    let selectedVar: any = null;
    if (selectEl && selectEl.value) {
      try {
        selectedVar = JSON.parse(selectEl.value);
      } catch (err) {
        console.error("Failed to parse variation", err);
      }
    }

    const basePrice = parseFloat(product.sale_price || product.base_price || product.price || 0);
    const price = selectedVar && selectedVar.price ? parseFloat(selectedVar.price) : basePrice;

    const variations = (() => {
      if (!product?.variations) return [];
      if (typeof product.variations === 'string') {
        try {
          const parsed = JSON.parse(product.variations);
          return Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch { return []; }
      }
      return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
    })();

    if (variations.length > 0 && !selectedVar) {
      toast.error("Please select a variation for this product");
      return;
    }

    const snapshot = selectedVar ? [
      selectedVar.size ? `Size: ${selectedVar.size}` : "",
      selectedVar.color ? `Color: ${selectedVar.color}` : "",
      selectedVar.weight ? `Weight: ${selectedVar.weight}` : "",
    ].filter(Boolean).join(", ") : "";

    const newItem = {
      product_id: product.id,
      product_variation_id: selectedVar ? selectedVar.id : null,
      product_name: product.name,
      unit_price: price,
      price: price,
      order_price: price,
      quantity: 1,
      variation_snapshot: snapshot,
      product: {
        id: product.id,
        name: product.name,
        image_url: product.image_url || product.image,
        product_code: product.product_code,
      }
    };

    setEditedOrder({
      ...editedOrder,
      items: [...(editedOrder.items || []), newItem]
    });

    setProductSearch("");
    setSearchResults([]);
    toast.success("Product added to order");
  };

  useEffect(() => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchingProducts(true);
      try {
        const res = await authFetch(`/admin/v1/products?search=${encodeURIComponent(productSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Product search failed", err);
      } finally {
        setSearchingProducts(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [productSearch]);

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

  const updatePaymentStatus = async (newPaymentStatus: string) => {
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
        toast.success("Payment status updated");
        fetchOrderDetails();
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

  const getPaymentStatusBadge = (status: string) => {
    const styles: any = {
      unpaid: "bg-red-100 text-red-700 border-red-200",
      paid: "bg-green-100 text-green-700 border-green-200",
      partial: "bg-amber-100 text-amber-750 border-amber-200",
    };
    const key = status ? status.toLowerCase() : "unpaid";
    return (
      <span
        className={clsx(
          "px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider border",
          styles[key] || "bg-gray-100 text-gray-700"
        )}
      >
        {key}
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 mr-2">
              Order #{order.order_number || order.id}
            </h1>
            {getStatusBadge(order.status)}
            {getPaymentStatusBadge(order.payment_status)}
          </div>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                disabled={savingOrder}
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold disabled:opacity-50"
              >
                <Save size={18} /> Save Changes
              </button>
              <button
                disabled={savingOrder}
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-bold disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold"
              >
                <Edit size={18} /> Edit Order
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </>
          )}
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
                {isEditing ? (
                  <div className="p-5 space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                      <input
                        type="text"
                        value={editedOrder.name || ""}
                        onChange={(e) => setEditedOrder({ ...editedOrder, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        value={editedOrder.contact_number || ""}
                        onChange={(e) => setEditedOrder({ ...editedOrder, contact_number: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={editedOrder.email || ""}
                        onChange={(e) => setEditedOrder({ ...editedOrder, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
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
                {isEditing ? editedOrder.items?.length || 0 : order.items?.length || 0} items
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
                {isEditing ? (
                  <tbody className="divide-y divide-gray-100">
                    {editedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-100">
                              {item.product?.image_url || item.product?.image ? (
                                <img
                                  src={item.product.image_url || item.product.image}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package size={24} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.variation_snapshot || "No variation"}
                              </p>
                              {item.product?.product_code && (
                                <p className="mt-1">
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                    Code: {item.product.product_code}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          <div className="text-sm space-y-2">
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-xs text-gray-400">MRP:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price || item.price || 0}
                                onChange={(e) => {
                                  const newItems = [...editedOrder.items];
                                  newItems[idx].unit_price = parseFloat(e.target.value) || 0;
                                  newItems[idx].price = parseFloat(e.target.value) || 0;
                                  setEditedOrder({ ...editedOrder, items: newItems });
                                }}
                                className="w-20 px-2 py-1 border rounded text-center text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-xs text-green-600 font-bold">DRP:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.order_price || 0}
                                onChange={(e) => {
                                  const newItems = [...editedOrder.items];
                                  newItems[idx].order_price = parseFloat(e.target.value) || 0;
                                  setEditedOrder({ ...editedOrder, items: newItems });
                                }}
                                className="w-20 px-2 py-1 border rounded text-center text-xs text-green-600 font-bold border-green-200"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...editedOrder.items];
                                newItems[idx].quantity = Math.max(1, (newItems[idx].quantity || 1) - 1);
                                setEditedOrder({ ...editedOrder, items: newItems });
                              }}
                              className="p-1 border rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...editedOrder.items];
                                newItems[idx].quantity = parseInt(e.target.value) || 1;
                                setEditedOrder({ ...editedOrder, items: newItems });
                              }}
                              className="w-12 px-1 py-1 border rounded text-center font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...editedOrder.items];
                                newItems[idx].quantity = (newItems[idx].quantity || 1) + 1;
                                setEditedOrder({ ...editedOrder, items: newItems });
                              }}
                              className="p-1 border rounded bg-gray-50 hover:bg-gray-100 text-gray-600"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <div className="text-sm text-right leading-tight">
                              <div className="font-bold text-gray-900">
                                ৳{((item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                              </div>
                              <div className="font-semibold text-green-600 mt-1">
                                ৳{((item.order_price || 0) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = editedOrder.items.filter((_: any, i: number) => i !== idx);
                                setEditedOrder({ ...editedOrder, items: newItems });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
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
                                  {item.product?.product_code ? (
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
                )}
              </table>
            </div>

            {/* Add Product Section for Edit Mode */}
            {isEditing && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" /> Add Product to Order
                </h3>
                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search products by name or code..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-sm"
                    />
                  </div>
                  {searchingProducts && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100 z-10 relative">
                    {searchResults.map((product: any) => {
                      const variations = (() => {
                        if (!product?.variations) return [];
                        if (typeof product.variations === 'string') {
                          try {
                            const parsed = JSON.parse(product.variations);
                            return Array.isArray(parsed) ? parsed : Object.values(parsed);
                          } catch { return []; }
                        }
                        return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
                      })();

                      return (
                        <div key={product.id} className="p-3 hover:bg-gray-50 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                              {product.image_url || product.image ? (
                                <img
                                  src={product.image_url || product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-500">
                                Code: {product.product_code || "N/A"} | Price: ৳{product.price}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {variations.length > 0 && (
                              <select
                                id={`var-select-${product.id}`}
                                className="text-xs border rounded p-1 bg-white"
                              >
                                <option value="">Select Variation</option>
                                {variations.map((v: any, index: number) => {
                                  const size = v.size || "";
                                  const color = v.color || "";
                                  const weight = v.weight || "";
                                  const label = [
                                    size ? `Size: ${size}` : "",
                                    color ? `Color: ${color}` : "",
                                    weight ? `Weight: ${weight}` : "",
                                  ].filter(Boolean).join(", ");
                                  return (
                                    <option key={index} value={JSON.stringify(v)}>
                                      {label || `Variation #${index + 1}`} (৳{v.price || product.price})
                                    </option>
                                  );
                                })}
                              </select>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAddProductToOrder(product)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition flex items-center gap-1"
                            >
                              <Plus size={12} /> Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              {isEditing ? (
                <div className="max-w-md ml-auto space-y-4 text-sm">
                  <div className="flex justify-between items-center text-gray-600 gap-4">
                    <span>Shipping Cost (৳)</span>
                    <input
                      type="number"
                      min="0"
                      value={editedOrder.shipping_cost || 0}
                      onChange={(e) => setEditedOrder({ ...editedOrder, shipping_cost: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1 border rounded text-right font-semibold text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center text-gray-600 gap-4">
                    <span>Discount (৳)</span>
                    <input
                      type="number"
                      min="0"
                      value={editedOrder.discount || 0}
                      onChange={(e) => setEditedOrder({ ...editedOrder, discount: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1 border rounded text-right font-semibold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                    {/* DRP Summary */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1 text-center">
                        DRP Calculation
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold">৳{
                          editedOrder.items?.reduce((sum: number, item: any) => sum + (item.order_price || 0) * item.quantity, 0).toFixed(2)
                        }</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-dashed">
                        <span>Total</span>
                        <span className="text-green-600">
                          ৳{
                            (editedOrder.items?.reduce((sum: number, item: any) => sum + (item.order_price || 0) * item.quantity, 0) + parseFloat(editedOrder.shipping_cost || 0)).toFixed(2)
                          }
                        </span>
                      </div>
                    </div>

                    {/* MRP Summary */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1 text-center">
                        MRP Calculation
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold">৳{
                          editedOrder.items?.reduce((sum: number, item: any) => sum + (item.unit_price || item.price || 0) * item.quantity, 0).toFixed(2)
                        }</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-dashed">
                        <span>Total</span>
                        <span className="text-blue-600">
                          ৳{
                            (editedOrder.items?.reduce((sum: number, item: any) => sum + (item.unit_price || item.price || 0) * item.quantity, 0) - parseFloat(editedOrder.discount || 0) + parseFloat(editedOrder.shipping_cost || 0)).toFixed(2)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs ml-auto grid grid-cols-2 gap-6">
                  {/* Left Column - DRP Summary */}
                  <div className="space-y-3 text-sm">
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
                  <div className="space-y-3 text-sm">
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
              )}
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

          {/* Payment Status Update Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" />
              Update Payment Status
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "unpaid", label: "Unpaid", activeClass: "bg-red-600 text-white border-red-600 shadow-lg shadow-red-100" },
                { key: "paid", label: "Paid", activeClass: "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100" },
                { key: "partial", label: "Partial", activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100" },
              ].map((p) => (
                <button
                  key={p.key}
                  disabled={paymentStatusUpdating}
                  onClick={() => updatePaymentStatus(p.key)}
                  className={clsx(
                    "px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all uppercase tracking-wider",
                    (order.payment_status || "unpaid") === p.key
                      ? p.activeClass
                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                  )}
                >
                  {p.label}
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
            {isEditing ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editedOrder.name || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editedOrder.contact_number || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, contact_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editedOrder.email || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  />
                </div>
              </div>
            ) : (
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
            )}
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
              {isEditing ? (
                <div className="space-y-4">
                  {isAddressJson ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={shippingAddressEdit.name}
                          onChange={(e) => {
                            const updated = { ...shippingAddressEdit, name: e.target.value };
                            setShippingAddressEdit(updated);
                            setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                        <textarea
                          rows={2}
                          value={shippingAddressEdit.address}
                          onChange={(e) => {
                            const updated = { ...shippingAddressEdit, address: e.target.value };
                            setShippingAddressEdit(updated);
                            setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                          <input
                            type="text"
                            value={shippingAddressEdit.city}
                            onChange={(e) => {
                              const updated = { ...shippingAddressEdit, city: e.target.value };
                              setShippingAddressEdit(updated);
                              setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Area</label>
                          <input
                            type="text"
                            value={shippingAddressEdit.area}
                            onChange={(e) => {
                              const updated = { ...shippingAddressEdit, area: e.target.value };
                              setShippingAddressEdit(updated);
                              setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                        <input
                          type="text"
                          value={shippingAddressEdit.phone}
                          onChange={(e) => {
                            const updated = { ...shippingAddressEdit, phone: e.target.value };
                            setShippingAddressEdit(updated);
                            setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address Details</label>
                      <textarea
                        rows={4}
                        value={editedOrder.shipping_address || ""}
                        onChange={(e) => setEditedOrder({ ...editedOrder, shipping_address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Order Notes</label>
                    <textarea
                      rows={2}
                      value={editedOrder.notes || ""}
                      onChange={(e) => setEditedOrder({ ...editedOrder, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextIsJson = !isAddressJson;
                        setIsAddressJson(nextIsJson);
                        if (nextIsJson) {
                          const updated = { name: editedOrder.name || "", address: editedOrder.shipping_address || "", city: "", area: "", phone: editedOrder.contact_number || "" };
                          setShippingAddressEdit(updated);
                          setEditedOrder({ ...editedOrder, shipping_address: JSON.stringify(updated) });
                        } else {
                          setEditedOrder({ ...editedOrder, shipping_address: shippingAddressEdit.address || "" });
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Switch to {isAddressJson ? "Raw Text" : "Structured Form"}
                    </button>
                  </div>
                </div>
              ) : shippingAddress ? (
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
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase">Order Notes</p>
                      <p className="text-gray-600 text-xs italic mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {order.shipping_address || "No shipping address provided"}
                  </p>
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase">Order Notes</p>
                      <p className="text-gray-600 text-xs italic mt-1">{order.notes}</p>
                    </div>
                  )}
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
                  Payment Status:
                </span>
                {getPaymentStatusBadge(order.payment_status)}
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