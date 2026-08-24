"use client";

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { Camera, Save, User as UserIcon, Mail, Phone, Loader2, Key, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Image from "next/image";

const AdminProfilePage = () => {
    const { user: authUser, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        gender: 'Male',
        date_of_birth: '',
        password: '',
        confirm_password: '',
        image: null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch('/auth/user');
            const response = await res.json();
            if (res.ok) {
                // Auth fetch returns user directly or wrapped
                const data = response.data || response.user || response;
                setProfile({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    gender: data.gender || 'Male',
                    date_of_birth: data.date_of_birth || '',
                    password: '',
                    confirm_password: '',
                    image: null
                });
                
                if (data.image) {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
                    setPreviewUrl(data.image.startsWith('http') ? data.image : `${baseUrl}/storage/${data.image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            toast.error('Failed to load profile info');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfile((prev: any) => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (profile.password && profile.password !== profile.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('first_name', profile.first_name);
            formData.append('last_name', profile.last_name);
            formData.append('email', profile.email);
            formData.append('phone_number', profile.phone_number || '');
            formData.append('gender', profile.gender);
            if (profile.date_of_birth) {
                formData.append('date_of_birth', profile.date_of_birth);
            }
            if (profile.password) {
                formData.append('password', profile.password);
            }
            if (profile.image) {
                formData.append('image', profile.image);
            }

            const res = await authFetch('/auth/user', {
                method: 'POST', // POST with matching puts supported via Laravel multi-method or POST route definition
                body: formData
            });

            const response = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully');
                if (response.user) {
                    updateUser(response.user);
                }
                setProfile((prev: any) => ({
                    ...prev,
                    password: '',
                    confirm_password: ''
                }));
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating admin profile:', error);
            toast.error('An error occurred while saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden mb-8">
                {/* Banner Profile Summary */}
                <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-800 relative"></div>
                
                <div className="px-6 md:px-8 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md relative group">
                                {previewUrl ? (
                                    <Image fill sizes="100vw" src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-4xl">
                                        {profile.first_name ? profile.first_name.charAt(0) : 'A'}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                                    <Camera size={20} />
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </label>
                            </div>
                            <div className="mb-2">
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                    {profile.first_name} {profile.last_name || 'Admin'}
                                </h2>
                                <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wider">{authUser?.role || 'Administrator'}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Basic Info */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><UserIcon size={18} /></span>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><UserIcon size={18} /></span>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Mail size={18} /></span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Phone size={18} /></span>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            value={profile.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium cursor-pointer"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Calendar size={18} /></span>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={profile.date_of_birth}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Security / Password Change */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Security & Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Key size={18} /></span>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Leave blank to keep current"
                                            value={profile.password}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Key size={18} /></span>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            placeholder="Leave blank to keep current"
                                            value={profile.confirm_password}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm transition font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-100 pt-6 flex justify-end gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Saving Profile...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
