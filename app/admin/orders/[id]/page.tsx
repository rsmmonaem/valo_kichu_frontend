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
  Eye,
  PhoneCall,
  Globe,
  Facebook,
  Upload,
  Image as ImageIcon,
  FileText,
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
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);
  const [loadingPreviousOrders, setLoadingPreviousOrders] = useState<boolean>(false);

  // CRM Call Log States
  const [crmCallStatus, setCrmCallStatus] = useState("contacted");
  const [crmCallDate, setCrmCallDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [crmNextCallDate, setCrmNextCallDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  });
  const [crmNote, setCrmNote] = useState("");
  const [savingCrmLog, setSavingCrmLog] = useState(false);

  // Courier Modal States
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("steadfast");
  const [courierRecipientName, setCourierRecipientName] = useState("");
  const [courierRecipientPhone, setCourierRecipientPhone] = useState("");
  const [courierRecipientAddress, setCourierRecipientAddress] = useState("");
  const [courierCodAmount, setCourierCodAmount] = useState<number | string>(0);
  const [courierNote, setCourierNote] = useState("");
  const [sendingToCourier, setSendingToCourier] = useState(false);
  const [courierError, setCourierError] = useState<string | null>(null);

  // Refund Modal States
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundItems, setRefundItems] = useState<any[]>([]);
  const [refunding, setRefunding] = useState(false);

  // Dynamic Source Pages States
  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [loadingSourcePages, setLoadingSourcePages] = useState(false);
  const [customPageInput, setCustomPageInput] = useState("");
  const [customPageLogo, setCustomPageLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showAddCustomPage, setShowAddCustomPage] = useState(false);
  const [updatingPageName, setUpdatingPageName] = useState(false);

  const getProductImage = (item: any) => {
    // 1. Try to parse color name from variation_snapshot
    let selectedColorName = "";
    if (item.variation_snapshot) {
      const match = item.variation_snapshot.match(/Color:\s*([^,]+)/i);
      if (match) {
        selectedColorName = match[1].trim().toLowerCase();
      }
    }

    // 2. Try to match color image in product.colors
    if (selectedColorName && item.product && Array.isArray(item.product.colors)) {
      const matchedColor = item.product.colors.find(
        (c: any) => c.name && c.name.trim().toLowerCase() === selectedColorName
      );
      if (matchedColor) {
        const imgPath = matchedColor.image || matchedColor.color_image;
        if (imgPath) {
          if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            return imgPath;
          }
          // Resolve storage prefix using base product's image_url
          const productImageUrl = item.product.image_url || "";
          if (productImageUrl && (productImageUrl.includes('http://') || productImageUrl.includes('https://'))) {
            try {
              const url = new URL(productImageUrl);
              const cleanPath = imgPath.replace(/^\/?(storage\/)?(products\/)?/, '');
              return `${url.origin}/storage/products/${cleanPath}`;
            } catch (e) {
              // Fallback
            }
          }
          const cleanPath = imgPath.replace(/^\/?(storage\/)?(products\/)?/, '');
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
          return `${baseUrl}/storage/products/${cleanPath}`;
        }
      }
    }

    return item.product?.image_url || item.product?.image || "";
  };

  const fetchSourcePages = async () => {
    setLoadingSourcePages(true);
    try {
      const res = await authFetch("/admin/v1/source-pages");
      if (res.ok) {
        const data = await res.json();
        setAvailablePages(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSourcePages(false);
    }
  };

  useEffect(() => {
    fetchSourcePages();
  }, []);

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "pages");

    setUploadingLogo(true);
    try {
      const res = await authFetch("/admin/v1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCustomPageLogo(data.url);
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error(data.error || data.message || "Logo upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSelectPageName = async (pageName: string) => {
    if (!pageName) return;
    setUpdatingPageName(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_name: pageName }),
      });

      if (res.ok) {
        toast.success(`Order page updated to "${pageName}"`);
        setOrder((prev: any) => ({ ...prev, page_name: pageName }));
      } else {
        toast.error("Failed to update page name");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setUpdatingPageName(false);
    }
  };

  const handleAddCustomPageName = async () => {
    if (!customPageInput.trim()) {
      toast.error("Please enter a page name");
      return;
    }

    try {
      const res = await authFetch("/admin/v1/source-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customPageInput.trim(),
          logo: customPageLogo || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("New page created!");
        const newPage = data.data;
        setAvailablePages((prev) => [newPage, ...prev]);
        setCustomPageInput("");
        setCustomPageLogo("");
        setShowAddCustomPage(false);
      } else {
        toast.error(data.message || "Failed to create page");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong creating page");
    }
  };

  const handleDeleteSourcePage = async (e: React.MouseEvent, pageId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this page source?")) return;

    try {
      const res = await authFetch(`/admin/v1/source-pages/${pageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Page deleted");
        setAvailablePages((prev) => prev.filter((p) => p.id !== pageId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete page");
    }
  };

  const handleSaveCrmLog = async () => {
    if (!crmCallStatus) {
      toast.error("Please select a call status");
      return;
    }
    setSavingCrmLog(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}/crm-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          call_status: crmCallStatus,
          last_called_at: crmCallDate,
          next_call_at: crmNextCallDate,
          note: crmNote,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("CRM Call Log saved successfully!");
        if (data.order) {
          setOrder(data.order);
        } else {
          fetchOrderDetails();
        }
        setCrmNote("");
      } else {
        toast.error("Failed to save CRM log");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSavingCrmLog(false);
    }
  };

  const fetchPreviousOrders = async (currentOrder: any) => {
    if (!currentOrder) return;
    const phone = currentOrder.phone || currentOrder.contact_number || "";
    const email = currentOrder.email || "";

    if (!phone && !email) return;

    setLoadingPreviousOrders(true);
    try {
      const params = new URLSearchParams();
      if (phone) params.append("phone", phone);
      if (email) params.append("email", email);
      if (currentOrder.id) params.append("exclude_id", String(currentOrder.id));

      const res = await authFetch(`/admin/v1/orders/customer-history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPreviousOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch previous orders:", error);
    } finally {
      setLoadingPreviousOrders(false);
    }
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched order details:", data);
        setOrder(data);
        fetchPreviousOrders(data);
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
    if (newStatus === "transfer_to_courier") {
      // Prepare default modal form fields from current order data
      const name = order.name || order.user?.name || "Customer";
      const phone = order.phone || order.contact_number || order.user?.phone_number || "";
      let addressStr = "";
      try {
        const addr = JSON.parse(order.shipping_address);
        if (addr && typeof addr === 'object') {
          addressStr = [addr.address, addr.area, addr.city].filter(Boolean).join(", ");
        } else {
          addressStr = order.shipping_address || "";
        }
      } catch {
        addressStr = order.shipping_address || "";
      }

      setCourierRecipientName(name);
      setCourierRecipientPhone(phone);
      setCourierRecipientAddress(addressStr);
      setCourierCodAmount(order.total_price || order.total_amount || 0);
      setCourierNote(order.notes || "");
      setSelectedCourier("steadfast");
      setCourierError(null);
      setShowCourierModal(true);
      return;
    }

    if (newStatus === "refunded") {
      setRefundItems(
        order.items.map((item: any) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          refunded_quantity: item.refunded_quantity || 0,
          refund_input_qty: 0,
        }))
      );
      setShowRefundModal(true);
      return;
    }

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

  const handleConfirmSendCourier = async () => {
    setCourierError(null);
    if (!courierRecipientName.trim() || !courierRecipientPhone.trim() || !courierRecipientAddress.trim()) {
      const errMsg = "Please fill in recipient name, phone, and address.";
      setCourierError(errMsg);
      toast.error(errMsg);
      return;
    }

    setSendingToCourier(true);
    try {
      const res = await authFetch(`/admin/v1/orders/${orderId}/send-courier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courier_name: selectedCourier,
          recipient_name: courierRecipientName,
          recipient_phone: courierRecipientPhone,
          recipient_address: courierRecipientAddress,
          cod_amount: parseFloat(String(courierCodAmount)) || 0,
          note: courierNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Order confirmed & sent to courier!");
        setShowCourierModal(false);
        fetchOrderDetails();
      } else {
        const errMsg = data.message || "Failed to send order to courier";
        setCourierError(errMsg);
        toast.error(errMsg);
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.message || "Something went wrong with courier dispatch";
      setCourierError(errMsg);
      toast.error(errMsg);
    } finally {
      setSendingToCourier(false);
    }
  };

  const handleConfirmRefund = async () => {
    setRefunding(true);
    try {
      const payload = {
        refund_items: refundItems.map((item) => ({
          item_id: item.id,
          refund_quantity: item.refund_input_qty,
        })),
      };
      const res = await authFetch(`/admin/v1/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Refund processed successfully!");
        setShowRefundModal(false);
        fetchOrderDetails();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to process refund");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during refund processing");
    } finally {
      setRefunding(false);
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
      contacted: "bg-teal-100 text-teal-700",
      confirmed: "bg-green-100 text-green-600",
      purchased_by_admin: "bg-indigo-100 text-indigo-700",
      ready_to_ship_bd: "bg-purple-100 text-purple-700",
      shipping: "bg-orange-100 text-orange-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-pink-100 text-pink-700",
      transfer_to_courier: "bg-sky-100 text-sky-700",
      returned: "bg-rose-100 text-rose-700",
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

  const getVariationSku = (item: any) => {
    if (item.variation?.sku) return item.variation.sku;

    if (item.product?.variations && item.variation_snapshot) {
      try {
        const vars = typeof item.product.variations === 'string' ? JSON.parse(item.product.variations) : item.product.variations;
        const variationsArr = Array.isArray(vars) ? vars : Object.values(vars);

        const snapshot = item.variation_snapshot.toLowerCase();

        for (const v of variationsArr as any[]) {
          if (!v.sku) continue;

          const size = String(v.size || v.attributes?.Weight || v.attributes?.Size || "").toLowerCase();
          const color = String(v.color || "").toLowerCase();

          let matches = true;
          if (size && !snapshot.includes(size)) matches = false;
          if (color && !snapshot.includes(color)) matches = false;

          if (matches && (size || color)) {
            return v.sku;
          }
        }
      } catch (e) {
        return null;
      }
    }

    return null;
  };

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
          <p className="text-gray-500 mt-1" suppressHydrationWarning>
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
                onClick={() => {
                  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
                  window.open(`${baseUrl}/api/v1/invoice/${order.order_number || order.id}/preview`, '_blank');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 font-bold shadow-sm"
              >
                <FileText size={18} /> View Invoice
              </button>
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
                              {getProductImage(item) ? (
                                <img
                                  src={getProductImage(item)}
                                  alt={item.product_name || item.product?.name}
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
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(item.product?.product_code || item.product?.product_sku) && (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                    Code: {item.product.product_code || item.product.product_sku}
                                  </span>
                                )}
                                {(() => {
                                  const varSku = getVariationSku(item);
                                  if (!varSku) return null;
                                  return (
                                    <span className="text-xs bg-blue-50 px-2 py-1 rounded-lg text-blue-600 font-mono border border-blue-100">
                                      Var SKU: {varSku}
                                    </span>
                                  );
                                })()}
                              </div>
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
                            {order.order_type === 'dropshipping' && (
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
                            )}
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
                              {order.order_type === 'dropshipping' && (
                                <div className="font-semibold text-green-600 mt-1">
                                  ৳{((item.order_price || 0) * item.quantity).toFixed(2)}
                                </div>
                              )}
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
                              {getProductImage(item) ? (
                                <img
                                  src={getProductImage(item)}
                                  alt={item.product_name || item.product?.name}
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
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(item.product?.product_code || item.product?.product_sku) ? (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                      Code: {item.product.product_code || item.product.product_sku}
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono">
                                      SKU not available
                                    </span>
                                  )}
                                  {(() => {
                                    const varSku = getVariationSku(item);
                                    if (!varSku) return null;
                                    return (
                                      <span className="text-xs bg-blue-50 px-2 py-1 rounded-lg text-blue-600 font-mono border border-blue-100">
                                        Var SKU: {varSku}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">
                          <div className="text-sm leading-tight">
                            <div>MRP: ৳{item.price || item.unit_price}</div>
                            {order.order_type === 'dropshipping' && (
                              <div className="font-semibold text-green-600 mt-1">
                                DRP: ৳{item.order_price || 0}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold">
                              {item.quantity}
                            </span>
                            {item.refunded_quantity > 0 && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                Refunded: {item.refunded_quantity}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold ">
                          <div className="text-sm leading-tight">
                            <div>৳{item.total || item.total_price}</div>
                            {order.order_type === 'dropshipping' && (
                              <div className="font-semibold text-green-600 mt-1">
                                ৳{(item.order_price * item.quantity || 0).toFixed(2)}
                              </div>
                            )}
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

                  <div className={`grid gap-6 pt-4 border-t border-gray-200 ${order.order_type === 'dropshipping' ? 'grid-cols-2' : 'grid-cols-1 max-w-xs ml-auto'}`}>
                    {/* DRP Summary - only for dropshipping */}
                    {order.order_type === 'dropshipping' && (
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
                    )}

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
                <div className={`ml-auto ${order.order_type === 'dropshipping' ? 'max-w-xs grid grid-cols-2 gap-6' : 'max-w-[200px]'}`}>
                  {/* Left Column - DRP Summary - only for dropshipping */}
                  {order.order_type === 'dropshipping' && (
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
                  )}

                  {/* MRP Summary */}
                  <div className="space-y-3 text-sm">
                    <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2 text-center">
                      {order.order_type === 'dropshipping' ? 'MRP Calculation' : 'Order Total'}
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
                "contacted",
                "confirmed",
                "purchased_by_admin",
                "ready_to_ship_bd",
                "transfer_to_courier",
                "shipping",
                "delivered",
                "cancelled",
                "refunded",
                "returned",
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

          {/* CRM Follow-up / Call Log Card - Only shown when status is 'contacted' */}
          {order.status === "contacted" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 leading-tight">
                      CRM Call &amp; Follow-up Log
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Track call status, date &amp; conversation notes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {order.call_status && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 uppercase font-bold">Status:</span>
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                        order.call_status === 'contacted' && "bg-green-100 text-green-700 border-green-200",
                        order.call_status === 'no_answer' && "bg-red-100 text-red-700 border-red-200",
                        order.call_status === 'busy' && "bg-amber-100 text-amber-700 border-amber-200",
                        order.call_status === 'callback_requested' && "bg-purple-100 text-purple-700 border-purple-200",
                        order.call_status === 'wrong_number' && "bg-gray-100 text-gray-700 border-gray-200",
                      )}>
                        {order.call_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {order.next_call_at && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-blue-500 uppercase font-bold">Next Call:</span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
                        {new Date(order.next_call_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Form */}
              <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-150 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                    Call Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "contacted", label: "Contacted" },
                      { key: "no_answer", label: "No Answer" },
                      { key: "busy", label: "Busy" },
                      { key: "callback_requested", label: "Callback Requested" },
                      { key: "wrong_number", label: "Wrong Number" },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setCrmCallStatus(item.key)}
                        className={clsx(
                          "px-3 py-2 rounded-lg text-xs font-bold transition border",
                          crmCallStatus === item.key
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                      Call Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={crmCallDate}
                      onChange={(e) => setCrmCallDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-600 mb-1.5 flex items-center justify-between">
                      <span>Next Follow-up Call Date</span>
                      <span className="text-[10px] text-blue-500 lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={crmNextCallDate}
                      onChange={(e) => setCrmNextCallDate(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-blue-50/30 text-blue-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                    Conversation Note / Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter details of conversation with customer (e.g. Customer confirmed order, requested delivery tomorrow at 4 PM)..."
                    value={crmNote}
                    onChange={(e) => setCrmNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Last Called:</span>{" "}
                    {order.last_called_at ? new Date(order.last_called_at).toLocaleString() : "Never called"}
                  </div>
                  <button
                    disabled={savingCrmLog}
                    onClick={handleSaveCrmLog}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <PhoneCall size={16} /> Save CRM Call Log
                  </button>
                </div>
              </div>

              {/* Call Log History Timeline */}
              {order.crm_logs && order.crm_logs.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    Call History &amp; Notes ({order.crm_logs.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {order.crm_logs.map((log: any, idx: number) => (
                      <div key={log.id || idx} className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-1.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border",
                              log.call_status === 'contacted' && "bg-green-100 text-green-700 border-green-200",
                              log.call_status === 'no_answer' && "bg-red-100 text-red-700 border-red-200",
                              log.call_status === 'busy' && "bg-amber-100 text-amber-700 border-amber-200",
                              log.call_status === 'callback_requested' && "bg-purple-100 text-purple-700 border-purple-200",
                              log.call_status === 'wrong_number' && "bg-gray-100 text-gray-700 border-gray-200",
                            )}>
                              {(log.call_status || 'contacted').replace(/_/g, " ")}
                            </span>
                            {log.next_call_at && (
                              <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                Next Call: {new Date(log.next_call_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {new Date(log.called_at || log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.note ? (
                          <p className="text-gray-800 font-medium whitespace-pre-wrap pl-1">
                            &ldquo;{log.note}&rdquo;
                          </p>
                        ) : (
                          <p className="text-gray-400 italic pl-1">No notes recorded</p>
                        )}
                        <div className="text-[10px] text-gray-400 text-right">
                          Logged by: <span className="font-semibold text-gray-600">{log.created_by || 'Admin'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Previous Order List Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight">
                    Previous Order List
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Customer&apos;s past order history
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-100">
                {previousOrders.length} {previousOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            <div className="p-6">
              {loadingPreviousOrders ? (
                <div className="text-center py-8 text-gray-400 text-sm flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading previous orders...
                </div>
              ) : previousOrders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                  No previous orders found for this customer.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="py-3 px-4 font-bold">SL</th>
                        <th className="py-3 px-4 font-bold">Order ID</th>
                        <th className="py-3 px-4 font-bold">Date</th>
                        <th className="py-3 px-4 font-bold">Total</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold">Payment</th>
                        <th className="py-3 px-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {previousOrders.map((prevOrder: any, idx: number) => (
                        <tr key={prevOrder.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-gray-500 text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                            <Link href={`/admin/orders/${prevOrder.id}`} className="hover:underline">
                              #{prevOrder.order_number || prevOrder.id}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 text-xs" suppressHydrationWarning>
                            {new Date(prevOrder.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900 text-xs">
                            ৳{Number(prevOrder.total_price || prevOrder.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(prevOrder.status)}
                          </td>
                          <td className="py-3.5 px-4">
                            {getPaymentStatusBadge(prevOrder.payment_status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/admin/orders/${prevOrder.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition border border-blue-100"
                            >
                              <Eye size={14} /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {order.courier_name && (
                <div className="pt-3 border-t border-emerald-100 bg-emerald-50/50 p-3 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Truck size={14} /> Courier: {order.courier_name}
                  </p>
                  {order.courier_consignment_id && (
                    <p className="text-gray-700 font-mono">
                      Consignment ID: <span className="font-bold text-gray-900">{order.courier_consignment_id}</span>
                    </p>
                  )}
                  {order.courier_status && (
                    <p className="text-gray-700 capitalize">
                      Courier Status: <span className="font-semibold text-emerald-700">{order.courier_status.replace(/_/g, " ")}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Page Source Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/40 to-indigo-50/20 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                <Globe size={20} className="text-indigo-600" />
                Order Page Source
              </h2>
              {order.page_name && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {order.page_name}
                </span>
              )}
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Select or upload the logo &amp; name of the Facebook Page / Source where this order originated:
              </p>

              {/* Dynamic Page Buttons Grid */}
              {loadingSourcePages ? (
                <div className="text-center py-6 text-xs text-gray-400">Loading page sources...</div>
              ) : availablePages.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No pages added yet. Click "+ Add New Page &amp; Logo" below.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {availablePages.map((page) => {
                    const isSelected = (order.page_name || "").toLowerCase() === page.name.toLowerCase();
                    return (
                      <div
                        key={page.id}
                        onClick={() => handleSelectPageName(page.name)}
                        className={clsx(
                          "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition text-left cursor-pointer relative overflow-hidden group",
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-gray-50/70 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        )}
                      >
                        {page.logo ? (
                          <img
                            src={page.logo}
                            alt={page.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className={clsx("p-2 rounded-xl shrink-0", isSelected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600")}>
                            <Globe size={18} />
                          </div>
                        )}
                        <span className="truncate flex-1 font-bold text-xs">{page.name}</span>

                        <button
                          type="button"
                          title="Delete page"
                          onClick={(e) => handleDeleteSourcePage(e, page.id)}
                          className={clsx(
                            "opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg shrink-0",
                            isSelected ? "hover:bg-red-950 text-red-300" : "hover:bg-red-100 text-red-600"
                          )}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Add New Page Input with Logo Upload */}
              {showAddCustomPage ? (
                <div className="pt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Create Page &amp; Upload Logo
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Page Name / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. BD Fashion Official"
                      value={customPageInput}
                      onChange={(e) => setCustomPageInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-semibold text-gray-600">Page Logo (Optional)</label>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Recommended: 200x200 px (Square 1:1)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {customPageLogo ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-300 bg-white flex-shrink-0 shadow-xs">
                          <img src={customPageLogo} alt="Logo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCustomPageLogo("")}
                            className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl text-[10px] leading-none"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 text-xs font-semibold text-indigo-600 transition">
                          <Upload size={15} />
                          {uploadingLogo ? "Uploading..." : "Upload Logo Image (Square 1:1)"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomPage(false)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold transition hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomPageName}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Save &amp; Select
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddCustomPage(true)}
                  className="w-full py-2.5 bg-dashed border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add New Page &amp; Upload Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courier Selection & Auto Dispatch Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Truck size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Dispatch Order to Courier</h3>
                  <p className="text-xs text-emerald-100">Select courier service to automatically transfer order</p>
                </div>
              </div>
              <button
                onClick={() => setShowCourierModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              {courierError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <span>{courierError}</span>
                  <button onClick={() => setCourierError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                  Select Courier Service
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition ${selectedCourier === "steadfast"
                        ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value="steadfast"
                        checked={selectedCourier === "steadfast"}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Steadfast Courier</p>
                        <p className="text-xs text-gray-500">Auto-create consignment & tracking</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-md">
                      Active API
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition ${selectedCourier === "self"
                        ? "border-blue-500 bg-blue-50/40 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value="self"
                        checked={selectedCourier === "self"}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Self Delivery (In-House)</p>
                        <p className="text-xs text-gray-500">Confirm order without sending to external courier</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase rounded-md">
                      Self
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Consignment &amp; Recipient Details
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={courierRecipientName}
                    onChange={(e) => setCourierRecipientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      value={courierRecipientPhone}
                      onChange={(e) => setCourierRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">COD Amount (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={courierCodAmount}
                      onChange={(e) => setCourierCodAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Recipient Address</label>
                  <textarea
                    rows={2}
                    value={courierRecipientAddress}
                    onChange={(e) => setCourierRecipientAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="Handle with care..."
                    value={courierNote}
                    onChange={(e) => setCourierNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                disabled={sendingToCourier}
                onClick={() => setShowCourierModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingToCourier}
                onClick={handleConfirmSendCourier}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {sendingToCourier ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending to Steadfast...
                  </>
                ) : (
                  <>
                    <Truck size={16} /> Confirm &amp; Auto Transfer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-pink-600 to-rose-700 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <RefreshCcw size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Process Item-wise Refund</h3>
                  <p className="text-xs text-rose-100">Select items and quantities to refund/return</p>
                </div>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Order Items</p>
              <div className="space-y-3 divide-y divide-gray-100">
                {refundItems.map((item, idx) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-500">
                        Qty ordered: {item.quantity} | Already refunded: {item.refunded_quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity - item.refunded_quantity}
                        value={item.refund_input_qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const newRefundItems = [...refundItems];
                          newRefundItems[idx].refund_input_qty = Math.min(item.quantity - item.refunded_quantity, Math.max(0, val));
                          setRefundItems(newRefundItems);
                        }}
                        className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-center font-bold text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-bold transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={refunding}
                onClick={handleConfirmRefund}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                {refunding ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;