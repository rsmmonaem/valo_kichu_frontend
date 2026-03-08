"use client";

import React from "react";
import {
  ChevronLeft,
  Code,
  Shield,
  Zap,
  Globe,
  Lock,
  Terminal,
} from "lucide-react";
import Link from "next/link";

const ApiDocsPage = () => {
  const endpoints = [
    {
      method: "GET",
      url: "/api/dropshipping",
      desc: "Base inventory feed. Returns all active products with your personalized dropshipper pricing.",
      response: `{
    "status": "success",
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 5,
          "name": "Luxury Watch",
          "base_price": "2500.00",
          "your_price": "2100.00",
          "stock": 45
        }
      ]
    }
  }`,
    },
    {
      method: "GET",
      url: "/api/dropshipping/balance",
      desc: "Check your current wallet balance in real-time.",
      response: `{
    "status": "success",
    "data": {
      "balance": 15400.50,
      "currency": "BDT"
    }
  }`,
    },
  
    {
      method: "POST",
      url: "/api/dropshipping/orders",
      desc: "Place an order for your customer. Supports single product or multiple products in one request.",
      body: `{
    "products": [
      { "product_id": 5, "quantity": 2, "variation_id": 12, "order_price": 508.00 },
      { "product_id": 8, "quantity": 1 }
    ],
    "shipping_address": {
      "name": "John Doe",
      "phone": "017XXXXXXXX",
      "address": "House 1, Road 2",
      "city": "Dhaka"
    }
  }`,
      response: `{
    "status": "success",
    "message": "Order placed successfully.",
    "order_id": 18,
    "total_amount": 1016
  }`,
    },
  
    {
      method: "GET",
      url: "/api/dropshipping/tracking?tracking_number=ORD-699D64BCA354D",
      desc: "Track an order using the tracking number.",
      response: `{
    "status": "success",
    "data": {
      "tracking_number": "ORD-699D64BCA354D",
      "status": "pending",
      "product_name": "Men's Stylish Premium Drop Shoulder - Black"
    }
  }`,
    },
  
    {
      method: "POST",
      url: "/api/dropshipping/cancel-order?order_number=ORD-69A94880A5FDA",
      desc: "Cancel an order using the order number.",
      response: `{
    "status": "success",
    "message": "Order cancelled successfully"
  }`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/dropshipper/dashboard/api-keys"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-200">
              <Code size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                API Documentation
              </h1>
              <p className="text-gray-500 font-medium italic mt-1">
                Dropshipper Integration Gateway v2.0
              </p>
              {/* Add Base URL section here */}
              <div className="mt-4 bg-gray-100 rounded-xl p-4 border border-gray-200 font-mono text-sm text-gray-700">
                <span className="font-bold">Base URL:</span>{" "}
                <code className="text-blue-700">
                  https://backend.valokichu.com/
                </code>
              </div>
            </div>
          </div>

          <div className="prose prose-blue max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
                <Shield className="text-emerald-500" size={24} /> Authentication
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                We offer two ways to authenticate your requests. Use **Simple
                Mode** for quick feeds and **Secure HMAC** for production
                systems and order placement.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <h3 className="text-emerald-900 font-black mb-2 uppercase text-xs tracking-widest">
                    Method A: Simple Mode
                  </h3>
                  <p className="text-emerald-700 text-sm mb-4 font-medium">
                    Perfect for browser checking or simple scripts.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 font-mono text-[10px] break-all">
                    ?key=YOUR_KEY&secret=YOUR_SECRET
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h3 className="text-blue-900 font-black mb-2 uppercase text-xs tracking-widest">
                    Method B: Secure HMAC
                  </h3>
                  <p className="text-blue-700 text-sm mb-4 font-medium">
                    Required for full security and POST requests.
                  </p>
                  <div className="space-y-1">
                    {["X-API-KEY", "X-SIGNATURE", "X-TIMESTAMP"].map((h) => (
                      <div
                        key={h}
                        className="text-[10px] font-black text-blue-900/40 uppercase tracking-tighter"
                      >
                        — {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-8">
                <Terminal className="text-blue-500" size={24} /> Endpoints
              </h2>

              <div className="space-y-12">
                {endpoints.map((ep, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-xs font-black ${
                          ep.method === "GET"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-lg font-black text-gray-900 tracking-tight">
                        {ep.url}
                      </code>
                    </div>
                    <p className="text-gray-600 font-medium mb-6 pl-1">
                      {ep.desc}
                    </p>

                    {ep.body && (
                      <div className="mb-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-4">
                          Request Body
                        </div>
                        <pre className="bg-slate-900 text-slate-300 p-6 rounded-[2rem] overflow-x-auto text-sm font-mono shadow-inner">
                          {ep.body}
                        </pre>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-4">
                        Sample Response
                      </div>
                      <pre className="bg-slate-900 text-emerald-400 p-6 rounded-[2rem] overflow-x-auto text-sm font-mono shadow-inner">
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <Zap className="absolute -right-4 -bottom-4 text-white/5 w-48 h-48 rotate-12" />
                <h2 className="text-2xl font-black mb-4 relative z-10">
                  HMAC Signature Logic
                </h2>
                <p className="text-slate-400 font-medium mb-6 relative z-10 leading-relaxed">
                  To sign a request, concatenate your{" "}
                  <span className="text-white font-bold italic">
                    Access Key
                  </span>{" "}
                  +{" "}
                  <span className="text-white font-bold italic">
                    Current Timestamp
                  </span>
                  , then hash it with your{" "}
                  <span className="text-white font-bold italic">
                    Secret Key
                  </span>{" "}
                  using SHA256.
                </p>
                <div className="bg-white/10 p-6 rounded-2xl font-mono text-xs border border-white/5 relative z-10">
                  signature = hash_hmac('sha256', timestamp + access_key,
                  secret_key)
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
