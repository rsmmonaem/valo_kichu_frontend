"use client";

import { useState } from "react";
import { authFetch } from "@/lib/api"; // Adjust the import path as needed
import { Database, Download, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface FailedProduct {
  name: string;
  api_id?: string;
  category?: string;
  reason: string;
}

interface ImportStats {
  total: number;
  created: number;
  skipped: number;
  failed: number;
}

function MohasagorImport() {
  const [loading, setLoading] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats>({
    total: 0,
    created: 0,
    skipped: 0,
    failed: 0,
  });
  const [processedCount, setProcessedCount] = useState(0);
  const [failedProducts, setFailedProducts] = useState<FailedProduct[]>([]);

  const handleFetchData = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Are you sure you want to import products from Mohasagor? This may take several minutes."
      )
    ) {
      return;
    }

    setLoading(true);
    setImportStats({
      total: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
    setProcessedCount(0);
    setFailedProducts([]);

    try {
      // API call to the new protected admin route
      const res = await authFetch("/admin/v1/mohasagor/import", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();

      if (responseData.success) {
        const { stats, data } = responseData;

        setImportStats(stats);
        setProcessedCount(stats.total);

        if (data.failed_products && Array.isArray(data.failed_products)) {
          setFailedProducts(data.failed_products);
        }

        alert(
          `Import completed!\n\nTotal: ${stats.total}\nCreated: ${stats.created}\nSkipped: ${stats.skipped}\nFailed: ${stats.failed}\n\nCheck console for failed product details.`
        );

        // Log failed products to console
        if (data.failed_products && data.failed_products.length > 0) {
          console.warn("Failed products:", data.failed_products);
        }
      } else {
        alert(`Import failed: ${responseData.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error importing products:", error);

      // Try to get error details from response
      let errorMessage = error.message || "Please check the console for details.";

      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = error.statusText || errorMessage;
        }
      }

      alert(`Error importing products: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const debugDatabase = async () => {
    try {
      const res = await authFetch("/admin/v1/mohasagor/debug");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }

      console.log("Debug Info:", data);
      alert(`Debug Status: ${data.status}\nMessage: ${data.message}\nCheck console for full details.`);

    } catch (error: any) {
      console.error("Debug failed:", error);
      alert(`Debug failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mohasagor Import</h1>
          <p className="text-gray-500 mt-1">Import products directly from Mohasagor API</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={debugDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <Database size={18} />
            Check Connection
          </button>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Info size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-lg mb-2">Import Process Guide</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-blue-800/80 text-sm list-disc pl-4">
              <li>Fetches updated product list from Mohasagor API</li>
              <li>Automatically skips existing products (by ID)</li>
              <li>Creates missing categories dynamically</li>
              <li>Downloads and processes product images</li>
              <li>Handles variations and stock levels</li>
              <li>Process happens server-side (please wait)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
          <Download size={32} />
        </div>

        <div className="max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Import?</h2>
          <p className="text-gray-500">
            This action will fetch products from the external API and add them to your store.
            Large imports may take several minutes to complete.
          </p>
        </div>

        <button
          onClick={handleFetchData}
          disabled={loading}
          className={`
                flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all
                ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-200 hover:scale-105 active:scale-95'
            }
            `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing Products...
            </>
          ) : (
            <>
              <span>Start Import Process</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Stats Area */}
      {importStats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Bar */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">Import Progress</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {Math.round((processedCount / importStats.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(processedCount / importStats.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-400 mt-2">
              Processed {processedCount} of {importStats.total} items
            </p>
          </div>

          {/* Stats Cards */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg text-emerald-600 shadow-sm">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-emerald-800 font-medium">Successfully Created</p>
              <p className="text-2xl font-bold text-emerald-700">{importStats.created}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg text-amber-600 shadow-sm">
              <Info size={24} />
            </div>
            <div>
              <p className="text-sm text-amber-800 font-medium">Skipped (Duplicate)</p>
              <p className="text-2xl font-bold text-amber-700">{importStats.skipped}</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg text-rose-600 shadow-sm">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-rose-800 font-medium">Failed Items</p>
              <p className="text-2xl font-bold text-rose-700">{importStats.failed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Items Table */}
      {failedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-rose-50/50 flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            <h3 className="font-semibold text-rose-900">Failed Products Log</h3>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium ml-auto">
              {failedProducts.length} Issues
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">API ID</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Reason for Failure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {failedProducts.slice(0, 10).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{product.api_id || "N/A"}</td>
                    <td className="px-6 py-3 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-rose-600">{product.reason}</td>
                  </tr>
                ))}
                {failedProducts.length > 10 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 bg-gray-50/30 font-medium">
                      ... and {failedProducts.length - 10} more items check console for full list
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MohasagorImport;