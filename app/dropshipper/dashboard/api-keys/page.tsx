"use client";

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Shield, Copy, Check } from 'lucide-react';
import { authFetch } from '@/lib/api';

interface ApiKey {
    id: number;
    name: string;
    key: string;
    secret: string;
    is_active: boolean;
    created_at: string;
}

const ApiKeysPage = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await authFetch('/dropshipper/api-keys');
            const data = await res.json();
            if (res.ok) {
                setKeys(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await authFetch('/dropshipper/api-keys', {
                method: 'POST',
                body: JSON.stringify({ name: newKeyName })
            });
            if (res.ok) {
                fetchKeys();
                setNewKeyName('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;
        try {
            const res = await authFetch(`/dropshipper/api-keys/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setKeys(keys.filter(k => k.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Generate New Key */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" /> New API Key
                        </h3>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                                    placeholder="e.g. My Shopify Store"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Key'}
                            </button>
                        </form>
                        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs text-orange-800 flex gap-3">
                            <Shield size={16} className="shrink-0" />
                            <p>Never share your API secret. It will only be visible once after generation.</p>
                        </div>
                    </div>
                </div>

                {/* Keys List */}
                <div className="md:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
                            <Key size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No API keys found. Generate one to get started.</p>
                        </div>
                    ) : (
                        keys.map((key) => (
                            <div key={key.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-800">{key.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {key.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(key.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">API Key (UUID)</span>
                                        <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-100 group">
                                            <span className="truncate flex-1">{key.key}</span>
                                            <button onClick={() => copyToClipboard(key.key, `key-${key.id}`)} className="text-gray-400 hover:text-blue-600">
                                                {copiedId === `key-${key.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Secret Key</span>
                                        <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-100 group">
                                            <span className="flex-1 truncate">••••••••••••••••••••••••••••••••</span>
                                            <button onClick={() => copyToClipboard(key.secret, `secret-${key.id}`)} className="text-gray-400 hover:text-blue-600">
                                                {copiedId === `secret-${key.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4">Created on {new Date(key.created_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiKeysPage;
