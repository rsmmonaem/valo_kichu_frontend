"use client";

import { useState, useRef, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { Database, Download, AlertTriangle, CheckCircle, XCircle, Info, Terminal, Activity, RefreshCw } from "lucide-react";

interface LogEntry {
  type: 'info' | 'error' | 'success' | 'warning' | 'default';
  message: string;
  timestamp: string;
}

interface ImportStats {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export default function MohasagorImport() {
  const [loading, setLoading] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats>({
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'default') => {
    setLogs(prev => [...prev, {
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleFetchData = async () => {
    if (typeof window !== "undefined" && !window.confirm("Start massive product import from Mohasagor?")) {
      return;
    }

    setLoading(true);
    setLogs([]);
    setImportStats({ created: 0, updated: 0, skipped: 0, failed: 0 });
    setCurrentPage(0);
    setTotalPages(0);
    addLog("Initializing connection to server...", "info");

    try {
      const response = await authFetch("/admin/v1/mohasagor/import", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        // Keep the last partial chunk in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const jsonStr = trimmed.substring(6); // remove "data: "
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'info':
                addLog(event.message, 'info');
                break;
              case 'progress':
                setCurrentPage(event.page);
                setTotalPages(event.total_pages);
                addLog(event.message, 'default');
                break;
              case 'batch_stats':
                setImportStats(prev => ({
                  created: prev.created + (event.created || 0),
                  updated: prev.updated + (event.updated || 0),
                  skipped: prev.skipped + (event.skipped || 0),
                  failed: prev.failed + (event.failed || 0),
                }));
                addLog(event.message, 'success');
                break;
              case 'warning':
                addLog(event.message, 'warning');
                break;
              case 'error':
                addLog(event.message, 'error');
                break;
              case 'done':
                addLog("Import process completed successfully.", 'success');
                setLoading(false);
                return; // Exit loop
            }
          } catch (e) {
            console.error("Failed to parse stream line", trimmed, e);
          }
        }
      }

    } catch (error: any) {
      console.error("Stream error:", error);
      addLog(`Fatal Error: ${error.message}`, 'error');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const debugDatabase = async () => {
    addLog("Checking system connectivity...", "info");
    try {
      const res = await authFetch("/admin/v1/mohasagor/debug");
      const data = await res.json();
      if (res.ok) {
        addLog(`System Status: ${data.message}`, 'success');
        addLog(`API URL: ${data.api_connection?.url}`, 'default');
        addLog(`API Status: ${data.api_connection?.status}`, data.api_connection?.success ? 'success' : 'error');
      } else {
        addLog(`Debug failed: ${data.message}`, 'error');
      }
    } catch (error: any) {
      addLog(`Debug Connection Failed: ${error.message}`, 'error');
    }
  };

  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mohasagor Sync</h1>
          <p className="text-gray-500 mt-1">Real-time product synchronization engine</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={debugDatabase}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <Database size={16} />
            Check Connectivity
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Download className="text-blue-600" size={20} />}
          label="Created"
          value={importStats.created}
          color="bg-blue-50 border-blue-100 text-blue-700"
        />
        <StatCard
          icon={<RefreshCw className="text-indigo-600" size={20} />}
          label="Updated"
          value={importStats.updated}
          color="bg-indigo-50 border-indigo-100 text-indigo-700"
        />
        <StatCard
          icon={<Info className="text-amber-600" size={20} />}
          label="Skipped"
          value={importStats.skipped}
          color="bg-amber-50 border-amber-100 text-amber-700"
        />
        <StatCard
          icon={<AlertTriangle className="text-rose-600" size={20} />}
          label="Failed"
          value={importStats.failed}
          color="bg-rose-50 border-rose-100 text-rose-700"
        />
      </div>

      {/* Main Control Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Actions & Progress */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${loading ? 'bg-blue-50 ring-4 ring-blue-100' : 'bg-gray-50'}`}>
              {loading ? <Activity className="text-blue-600 animate-pulse" size={32} /> : <Download className="text-gray-400" size={32} />}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{loading ? 'Syncing in Progress' : 'Ready to Sync'}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {loading
                ? 'Fetching products page by page. Do not close this window.'
                : 'Initiate the massive import process. This handles pagination automatically.'}
            </p>

            <button
              onClick={handleFetchData}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'
                }`}
            >
              {loading ? 'Processing...' : 'Start Import Engine'}
            </button>
          </div>

          {/* Progress Indicator */}
          {(loading || totalPages > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Batch Progress</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Page {currentPage} of {totalPages}</span>
                <span>{loading ? 'Active' : 'Idle'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Terminal Log */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-gray-400" />
                <span className="text-xs font-mono text-gray-300">Live Operation Log</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto font-mono text-xs md:text-sm space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
              {logs.length === 0 && (
                <div className="text-gray-600 italic text-center mt-20">Waiting for logs...</div>
              )}
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${getLogColor(log.type)}`}>
                  <span className="opacity-50 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className={`p-4 rounded-xl border ${color} bg-opacity-30 flex items-center gap-4 shadow-sm bg-white`}>
      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        {icon}
      </div>
      <div>
        <span className="text-sm font-medium text-gray-500 block mb-0.5">{label}</span>
        <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function getLogColor(type: LogEntry['type']) {
  switch (type) {
    case 'error': return 'text-red-400';
    case 'warning': return 'text-amber-400';
    case 'success': return 'text-emerald-400';
    case 'info': return 'text-blue-400';
    default: return 'text-gray-300';
  }
}