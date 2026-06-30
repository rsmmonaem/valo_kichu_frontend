"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api"; // Using authFetch for potential authenticated calls
import * as fpixel from "@/lib/fpixel";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
// import toast from "react-hot-toast";
import toast, { Toaster } from "react-hot-toast";
import { formatAmount } from "@/lib/utils/formatAmount";

interface ShippingMethod {
  id: number;
  name: string;
  cost: number;
}

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } =
    useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Meta Pixel: Track InitiateCheckout
  useEffect(() => {
    if (cart && cart.length > 0) {
      fpixel.event('InitiateCheckout', {
        content_ids: cart.map((item) => item.id.toString()),
        content_type: 'product',
        contents: cart.map((item) => ({
          id: item.id.toString(),
          quantity: item.quantity,
        })),
        value: cartTotal,
        currency: 'BDT',
        num_items: cart.reduce((acc, item) => acc + item.quantity, 0)
      });
    }
  }, []);

  // Initial state setup needs to leverage user data if available
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    country: "Bangladesh",
    zip_code: "",
    payment_method: "cod",
    notes: "",
    area: "", // "Inside Dhaka" | "Outside Dhaka"
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        // Use env var, or fallback to sensible default.
        // Note: authFetch in api.ts uses 'http://localhost:8000' as default base.
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const baseUrl = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

        const res = await fetch(`${baseUrl}/v1/shipping-methods`);

        if (res.ok) {
          const data = await res.json();

          setShippingMethods(data);
        } else {
          console.error("Failed to fetch shipping methods:", await res.text());
        }
      } catch (error) {
        console.error("Failed to fetch shipping methods", error);
      }
    };
    fetchShippingMethods();
  }, []);

  // Load user data into form when user is available
  useEffect(() => {
    if (user) {
      setCheckoutData((prev) => ({
        ...prev,
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.name ||
          prev.name,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        address_line1: user.address || prev.address_line1,
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCheckoutData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate shipping
    // Calculate shipping
    if (name === "area") {
      const method = shippingMethods.find((m) => m.name === value);
      if (method) {
        setShippingCost(Number(method.cost));
      } else {
        setShippingCost(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkoutData.area) {
      console.log("No delivery area selected");
      toast.error("Please select a Delivery Area before placing the order.");
      return;
    }
    setLoading(true);

    // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      // 1. Prepare Payload
      const orderPayload = {
        name: checkoutData.name,
        products: cart.map((item) => {
          // Construct a readable string for the selected variation
          const varDetails = [];
          if (item.variant?.size) varDetails.push(`Size: ${item.variant.size}`);
          if (item.variant?.color)
            varDetails.push(`Color: ${item.variant.color}`);
          if (item.variant?.weight)
            varDetails.push(`Weight: ${item.variant.weight}`);

          const variationSnapshot =
            varDetails.length > 0 ? varDetails.join(", ") : null;

          return {
            product_id: item.id,
            product_variation_id: item.variant?.id || null,
            variation_snapshot: variationSnapshot,
            quantity: item.quantity,
            price: item.price, // Send the actual displayed price (sale/variation price) to backend
          };
        }),
        shipping_address: `${checkoutData.address_line1}, ${checkoutData.area}, ${checkoutData.city}, ${checkoutData.country}`, // Simplified address string
        contact_number: checkoutData.phone,
        payment_method: checkoutData.payment_method,
        notes: checkoutData.notes,
        shipping_cost: shippingCost,
        // Guest specific info if needed by backend, though usually name/contact/address is enough
        email: checkoutData.email,
        referral_code:
          typeof window !== "undefined"
            ? localStorage.getItem("referral_code")
            : null,
        referral_source: "store_link",
      };

      // 2. Send Request
      // Use authFetch if logged in, otherwise regular fetch (but we need to handle guest checkout endpoint if it's different)
      // The Laravel 'checkout' endpoint typically handles both if configured, or we might need to send guest info specifically.
      // If user is logged in, authFetch adds the token, so backend knows the user.

      const res = await authFetch("/v1/order/checkout", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok) {
        // Meta Pixel: Track Purchase
        fpixel.event('Purchase', {
          content_ids: cart.map((item) => item.id.toString()),
          content_type: 'product',
          contents: cart.map((item) => ({
            id: item.id.toString(),
            quantity: item.quantity,
          })),
          value: Number(cartTotal) + Number(shippingCost),
          currency: 'BDT',
          order_id: data.order ? data.order.id : data.id || data.order_id
        });

        // Hande success
        clearCart();
        router.push(
          `/order-success?order=${data.order ? data.order.id : data.id || data.order_id
          }`
        );
        // toast.success("Order placed successfully!");
      } else {
        // toast.error(data.message || "Failed to place order");
        alert(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      // toast.error("Something went wrong");
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="text-gray-300 mb-6" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Cart is Empty
        </h2>
        <Link
          href="/products"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
          <div className="flex gap-2 items-center">
            <ShieldCheck size={28} className="text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Secure Checkout – Your information is protected
            </h1>
          </div>

          {!user && (
            <div className="text-sm">
              Already have an account?{" "}
              <Link
                href="/login?redirect=/checkout"
                className="text-blue-600 font-bold hover:underline"
              >
                Login here
              </Link>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {/* Left Column: Details */}
          <div className="space-y-6">
            {/* 1. Contact Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <ShieldCheck className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Contact Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={checkoutData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={checkoutData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={checkoutData.email}
                    onChange={handleChange}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <MapPin className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Delivery Address
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={checkoutData.address_line1}
                    onChange={handleChange}
                    required
                    placeholder="House, Road, Area"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={checkoutData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="zip_code"
                                            value={checkoutData.zip_code}
                                            onChange={handleChange}
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                                        />
                                    </div> */}
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Area
                  </label>
                  {/* <select
                                        name="area"
                                        value={checkoutData.area}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none bg-white"
                                    >
                                        <option value="">Select Area</option>
                                        {shippingMethods.map(method => (
                                            <option key={method.id} value={method.name}>
                                                {method.name} (৳{Math.floor(method.cost)})
                                            </option>
                                        ))}
                                    </select> */}

                  <div className="grid grid-cols-2 gap-2">
                    {shippingMethods.map((method) => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => {
                          setCheckoutData((prev) => ({
                            ...prev,
                            area: method.name,
                          }));
                          setShippingCost(method.cost); // Update the shipping cost based on the selected method
                        }}
                        className={`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 ${checkoutData.area === method.name
                          ? "bg-[#FFAC1C] text-white shadow-lg"
                          : "bg-gray-100"
                          }`}
                      >
                        {method.name} (৳{formatAmount(Math.floor(method.cost))})
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={checkoutData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your Order
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-6">
                {/* {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.variant?.id}`}
                    className="flex justify-between items-start text-sm gap-4"
                  >
                    <div className="flex gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded shrink-0 overflow-hidden">
                        <img
                          src={
                            item.image && item.image.startsWith("http")
                              ? item.image
                              : item.image
                                ? `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/${item.image}`
                                : "/placeholder.png"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between">

                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); removeFromCart(item.id, item.variant?.id); }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="flex items-center justify-start md:justify-center">
  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 w-fit">
    <span className="text-sm font-medium text-gray-500 md:hidden px-2">Qty:</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); updateQuantity(item.id, item.quantity - 1, item.variant?.id); }}
        className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50 bg-transparent"
        disabled={item.quantity <= 1}
      >
        <Minus size={14} />
      </button>
      <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); updateQuantity(item.id, item.quantity + 1, item.variant?.id); }}
        className="p-1 hover:bg-white rounded shadow-sm bg-transparent"
      >
        <Plus size={14} />
      </button>
    </div>
  </div>
</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">৳{formatAmount(item.price * item.quantity)}</p>
                    </div>

                  </div>
                ))} */}
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.variant?.id}`}
                    className="flex gap-3 text-sm border-b border-gray-100 pb-3 last:border-0"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded shrink-0 overflow-hidden">
                      <img
                        src={
                          item.image && item.image.startsWith("http")
                            ? item.image
                            : item.image
                              ? `${process.env.NEXT_PUBLIC_API_URL ||
                              "http://127.0.0.1:8000"
                              }/${item.image}`
                              : "/placeholder.png"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-2 mb-1">
                            {item.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mb-2">
                              {item.variant.size &&
                                `Size: ${item.variant.size}`}
                              {item.variant.color &&
                                `Color: ${item.variant.color}`}
                              {item.variant.weight &&
                                `Weight: ${item.variant.weight}`}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-gray-900 whitespace-nowrap">
                          ৳{formatAmount(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Controls and Remove Button */}
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.id, item.variant?.id);
                          }}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.variant?.id
                              );
                            }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 disabled:opacity-50 bg-transparent cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.variant?.id
                              );
                            }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded border border-gray-200 bg-transparent cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{formatAmount(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>৳{formatAmount(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ৳{formatAmount(Number(cartTotal) + Number(shippingCost))}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} /> Payment Method
                </h4>
                <div className="space-y-2">
                  <label
                    className={clsx(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      checkoutData.payment_method === "cod"
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={checkoutData.payment_method === "cod"}
                      onChange={handleChange}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-medium block text-gray-900">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay when you receive your order
                      </span>
                    </div>
                  </label>
                  <label
                    className={clsx(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      checkoutData.payment_method === "online"
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={checkoutData.payment_method === "online"}
                      onChange={handleChange}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-medium block text-gray-900">
                        Online Payment
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay securely via bKash/Nagad/Card
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              {/* Need Help Section */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h4 className="font-bold text-gray-800 mb-4 text-center">
                  Need any help with your order?
                </h4>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://wa.me/8801314861089"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 py-3 rounded-lg font-bold transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zM223.9 414.7c-32.9 0-65.1-8.8-93.3-25.5l-6.7-4-69.4 18.2 18.5-67.6-4.4-7C50.2 297.8 41.2 261 41.2 223.9c0-100.5 81.8-182.3 182.7-182.3 48.7 0 94.5 19 128.9 53.4 34.4 34.4 53.4 80.2 53.4 128.9 0 100.5-81.8 182.3-182.7 182.3zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.5-4.3 .9-4.3 3.6-9.8 1.4-2.8 2.8-5.6 1.4-8.3-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.7 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="tel:+8801314861089"
                    className="flex items-center justify-center gap-2 flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 rounded-lg font-bold transition"
                  >
                    <Phone size={18} />
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* new */}
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
