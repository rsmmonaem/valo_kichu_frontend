"use client";

import React, { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Save, Loader2, Home } from 'lucide-react';
import clsx from 'clsx';

interface Setting {
    key: string;
    value: string;
}

const HomeSettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});

    const sections = [
        { key: 'home_show_hero_slider', label: 'Hero Slider Area' },
        { key: 'home_show_shop_by_category', label: 'Shop by Category (Grid/Carousel)' },
        { key: 'home_show_new_arrivals', label: 'New Arrivals' },
        { key: 'home_show_dynamic_feeds', label: 'Dynamic Category Feeds' },
        { key: 'home_show_recommended', label: 'Recommended For You' },
        { key: 'home_show_infinite_products', label: 'Explore All Products' },
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await authFetch('/admin/v1/settings');
            if (res.ok) {
                const data: Setting[] = await res.json();
                const settingsMap: Record<string, string> = {};
                data.forEach(s => settingsMap[s.key] = s.value);
                setSettings(settingsMap);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: string) => {
        const currentValue = settings[key] !== 'false'; // default to true if undefined
        setSettings(prev => ({ ...prev, [key]: currentValue ? 'false' : 'true' }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                settings: Object.entries(settings).map(([key, value]) => ({ key, value }))
            };

            const res = await authFetch('/admin/v1/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success('Home settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Home size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Home Page Settings</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Section Visibility</h2>
                    <p className="text-sm text-gray-500 mb-6">Toggle the switches to show or hide specific sections on the main home page.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {sections.map((section) => {
                            const isVisible = settings[section.key] !== 'false'; // Defaults to true
                            return (
                                <div key={section.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="font-medium text-gray-700">{section.label}</span>
                                    <button
                                        onClick={() => handleToggle(section.key)}
                                        className={clsx(
                                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                            isVisible ? "bg-green-500" : "bg-gray-300"
                                        )}
                                        role="switch"
                                        aria-checked={isVisible}
                                    >
                                        <span
                                            className={clsx(
                                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                isVisible ? "translate-x-5" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeSettingsPage;
