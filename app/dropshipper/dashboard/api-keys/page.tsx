"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';
import { Key, Plus, Copy, Check, Trash2, Power, Loader2, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ApiKeysPage = () => {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await authFetch('/dropshipper/api-keys');
            const data = await res.json();
            setKeys(data.data || []);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const generateKey = async () => {
        const name = window.prompt("Enter a name for this API Key (e.g. 'My Website')", "Main Integration");
        if (!name) return;

        setGenerating(true);
        try {
            const res = await authFetch('/dropshipper/api-keys', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.status === 'success') {
                toast.success('API Key generated successfully');
                fetchKeys();
            }
        } catch (error) {
            console.error('Error generating key:', error);
            toast.error('Failed to generate key');
        } finally {
            setGenerating(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const res = await authFetch(`/dropshipper/api-keys/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (res.ok) {
                toast.success(`Key ${!currentStatus ? 'activated' : 'deactivated'}`);
                setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateIps = async (id: number, ipString: string) => {
        const ips = ipString.split(',').map(ip => ip.trim()).filter(ip => ip !== '');
        try {
            const res = await authFetch(`/dropshipper/api-keys/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    settings: { allowed_ips: ips }
                })
            });
            if (res.ok) {
                toast.success('IP Whitelist updated');
                setKeys(keys.map(k => k.id === id ? { ...k, settings: { ...k.settings, allowed_ips: ips } } : k));
            }
        } catch (error) {
            toast.error('Failed to update IPs');
        }
    };

    const deleteKey = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this API Key? Existing integrations will stop working.")) return;

        try {
            const res = await authFetch(`/dropshipper/api-keys/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('API Key deleted');
                setKeys(keys.filter(k => k.id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete key');
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Cpu size={32} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">API Gateway</h2>
                            <p className="text-slate-400 font-medium mt-1">
                                Securely integrate our inventory into your own platforms
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={generateKey}
                        disabled={generating}
                        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 group"
                    >
                        {generating ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        )}
                        Generate New Key
                    </button>
                </div>
            </div>

            {/* API Keys List */}
            <div className="grid gap-6">
                {keys.length > 0 ? (
                    keys.map((key) => (
                        <div
                            key={key.id}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${key.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        <h3 className="text-xl font-black text-gray-900">{key.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${key.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {key.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl transition-all">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Access Key</label>
                                            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl group/input">
                                                <code className="flex-1 text-sm font-bold text-gray-600 font-mono truncate">{key.key}</code>
                                                <button
                                                    onClick={() => copyToClipboard(key.key, `${key.id}-key`)}
                                                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all opacity-0 group-hover/input:opacity-100"
                                                >
                                                    {copiedId === `${key.id}-key` ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Secret Key</label>
                                            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl group/input">
                                                <code className="flex-1 text-sm font-bold text-gray-600 font-mono truncate">********************************</code>
                                                <button
                                                    onClick={() => copyToClipboard(key.secret, `${key.id}-secret`)}
                                                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all opacity-0 group-hover/input:opacity-100"
                                                >
                                                    {copiedId === `${key.id}-secret` ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IP Whitelisting */}
                                    <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-emerald-100 rounded-xl transition-all">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Whitelist (Comma separated)</label>
                                            <span className="text-[10px] text-emerald-500 font-bold">Secure</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50/50 p-2 rounded-2xl group/input border border-emerald-100/50">
                                            <input
                                                type="text"
                                                placeholder="e.g. 192.168.1.1, 203.0.113.5"
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none px-2"
                                                defaultValue={key.settings?.allowed_ips?.join(', ') || ''}
                                                onBlur={(e) => updateIps(key.id, e.target.value)}
                                            />
                                            <button className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm hover:bg-emerald-600 transition-all opacity-0 group-hover/input:opacity-100">
                                                <ShieldCheck size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col gap-3 pt-4 lg:pt-0 lg:border-l lg:pl-8 border-gray-100">
                                    <button
                                        onClick={() => toggleStatus(key.id, key.is_active)}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${key.is_active
                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            }`}
                                    >
                                        <Power size={18} />
                                        {key.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => deleteKey(key.id)}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Key size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No API Keys Found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            Generate your first API key to start integrating your dropshipping business with our automated inventory.
                        </p>
                    </div>
                )}
            </div>

            {/* Documentation Quick Link */}
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900">Developer Documentation</h4>
                        <p className="text-blue-700 text-sm">Learn how to sign your requests using HMAC-SHA256</p>
                    </div>
                </div>
                <Link href="/dropshipper/api-docs" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                    View Docs
                </Link>
            </div>
        </div>
    );
};

export default ApiKeysPage;
