"use client";

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { Camera, Save, User as UserIcon, Store, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
    const { user: authUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        store_name: '',
        image: null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch('/dropshipper/profile');
            const response = await res.json();
            if (response.status === 'success') {
                const data = response.data;
                setProfile({
                    first_name: data.user.first_name || '',
                    last_name: data.user.last_name || '',
                    email: data.user.email || '',
                    phone_number: data.user.phone_number || '',
                    store_name: data.store_name || '',
                    image: null
                });
                if (data.user.image_url) {
                    setPreviewUrl(data.user.image_url);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfile((prev: any) => ({ ...prev, image: file }));
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('first_name', profile.first_name);
            formData.append('last_name', profile.last_name);
            formData.append('email', profile.email);
            formData.append('phone_number', profile.phone_number);
            formData.append('store_name', profile.store_name);
            if (profile.image) {
                formData.append('image', profile.image);
            }

            // Using POST because we are sending FormData (image)
            const res = await authFetch('/dropshipper/profile', {
                method: 'POST',
                body: formData
            });

            const response = await res.json();

            if (response.status === 'success') {
                toast.success('Profile updated successfully');
                updateUser(response.data); // Update global auth context
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <UserIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Profile Settings</h2>
                        <p className="text-gray-500 font-medium italic">Manage your account information and store details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-50 overflow-hidden bg-gray-100 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={48} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all transform hover:scale-110">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Profile Picture</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Store Name */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Store size={12} className="text-emerald-500" /> Store Name
                            </label>
                            <input
                                type="text"
                                name="store_name"
                                value={profile.store_name}
                                onChange={handleInputChange}
                                placeholder="Your Store Name"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 font-black text-gray-900 transition-all outline-none text-lg"
                            />
                        </div>

                        {/* First Name */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <UserIcon size={12} className="text-blue-500" /> First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={profile.first_name}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 font-bold text-gray-900 transition-all outline-none"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <UserIcon size={12} className="text-blue-500" /> Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 font-bold text-gray-900 transition-all outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Mail size={12} className="text-indigo-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 font-bold text-gray-900 transition-all outline-none"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Phone size={12} className="text-purple-500" /> Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone_number"
                                value={profile.phone_number}
                                onChange={handleInputChange}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-500 font-bold text-gray-900 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
