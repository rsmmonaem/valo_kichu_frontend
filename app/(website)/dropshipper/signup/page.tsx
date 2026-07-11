"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, Ticket, TrendingUp } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import * as fpixel from '@/lib/fpixel';

const DropshipperSignupPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        referral_code: '', // Initialize empty to handle logic in useEffect
    });

    useEffect(() => {
        const urlRef = searchParams.get('ref');
        const localRef = typeof window !== 'undefined' ? localStorage.getItem('referral_code') : null;

        setFormData(prev => ({
            ...prev,
            referral_code: urlRef || localRef || ''
        }));
    }, [searchParams]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await authFetch('/register', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    role: 'dropshipper', // Force dropshipper role by default for this flow
                }),
            });

            const data = await res.json();

            if (res.ok && data.access_token) {
                // Fetch User Data to populate context
                const userRes = await authFetch('/v1/auth/user', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });

                let userData = data.user;
                if (userRes.ok) {
                    const userResData = await userRes.json();
                    userData = userResData.data || userResData;
                }

                login(data.access_token, userData);

                // Meta Pixel: Track CompleteRegistration & Lead
                const signupUserData = {
                    email: formData.email || undefined,
                    phone: formData.phone_number || undefined,
                    firstName: formData.first_name || undefined,
                    lastName: formData.last_name || undefined,
                    externalId: userData?.id ? String(userData.id) : undefined
                };
                fpixel.event('CompleteRegistration', {
                    status: true,
                    role: 'dropshipper'
                }, signupUserData);
                fpixel.event('Lead', {
                    content_category: 'Dropshipper Signup',
                    content_name: `${formData.first_name} ${formData.last_name}`,
                    status: 'Success'
                }, signupUserData);

                router.push('/dropshipper/dashboard');
            } else {
                setError(data.message || data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
            <Link href="/dropshipper" className="text-blue-600 mb-8 font-medium hover:underline flex items-center gap-2">
                ← Back to Dropshipper Info
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Dropshipper Registration</h2>
                    <p className="text-gray-500 mt-2">Start your business and grow with our network</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}



                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="first_name"
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                name="last_name"
                                type="text"
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                name="email"
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                name="phone_number"
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="017XXXXXXXX"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                            <input
                                name="confirm_password"
                                type="password"
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="••••••••"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-1 uppercase tracking-wider flex items-center gap-2">
                            <Ticket size={16} /> Referral Code (Optional)
                        </label>
                        <input
                            name="referral_code"
                            type="text"
                            className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition uppercase"
                            placeholder="CODE123"
                            value={formData.referral_code}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-blue-600 mt-1">If you were invited, enter the code to join the network.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Become a Dropshipper'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Already have an account? <Link href="/dropshipper/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default DropshipperSignupPage;
