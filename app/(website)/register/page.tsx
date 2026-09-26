"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, AlertCircle, X } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import * as fpixel from '@/lib/fpixel';
import { trackSignUp } from '@/lib/gtm';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);

    const getErrorMessage = (data: any): string => {
        if (!data) return 'Registration failed. Please try again.';

        // Handle Laravel validation errors object: { errors: { email: ['The email has already been taken.'] } }
        if (data.errors && typeof data.errors === 'object') {
            const messages: string[] = [];
            for (const field of Object.keys(data.errors)) {
                const val = data.errors[field];
                if (Array.isArray(val)) {
                    messages.push(...val);
                } else if (typeof val === 'string') {
                    messages.push(val);
                }
            }
            if (messages.length > 0) {
                return messages.join('\n');
            }
        }

        if (typeof data.message === 'string' && data.message.trim() && data.message !== 'The given data was invalid.') {
            return data.message;
        }

        if (typeof data.error === 'string' && data.error.trim()) {
            return data.error;
        }

        return 'Registration failed. Please check your information and try again.';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate actual email format
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
            const msg = "Please enter a valid email address (e.g. name@gmail.com)";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        // 2. Validate actual Bangladeshi phone number
        let cleanPhone = phone_number.trim().replace(/[\s-]/g, '');
        if (cleanPhone.startsWith('+880')) {
            cleanPhone = '0' + cleanPhone.slice(4);
        } else if (cleanPhone.startsWith('880')) {
            cleanPhone = '0' + cleanPhone.slice(3);
        }

        const bdPhoneRegex = /^01[3-9]\d{8}$/;
        if (!bdPhoneRegex.test(cleanPhone)) {
            const msg = "Please enter a valid 11-digit Bangladeshi mobile number starting with 013-019 (e.g. 017XXXXXXXX)";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        if (password !== confirmPassword) {
            const msg = "Passwords do not match";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        if (password.length < 6) {
            const msg = "Password must be at least 6 characters long";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await authFetch('/register', {
                method: 'POST',
                body: JSON.stringify({ 
                    name: name.trim(), 
                    email: trimmedEmail, 
                    phone_number: cleanPhone, 
                    password, 
                    password_confirmation: confirmPassword 
                }),
            });

            const data = await res.json();

            if (res.ok && data.access_token) {
                // Fetch User Data
                const userRes = await authFetch('/v1/auth/user', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });

                let userData: any = null;
                if (userRes.ok) {
                    const userResData = await userRes.json();
                    userData = userResData.data || userResData;
                }

                if (!userData) {
                    userData = { name, email: trimmedEmail, id: 0, role: 'customer' };
                }

                login(data.access_token, userData);

                const nameParts = (name || '').trim().split(/\s+/);
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Unified GA4 sign_up & Meta Pixel CompleteRegistration
                trackSignUp('email', {
                    email: trimmedEmail || undefined,
                    phone: cleanPhone || undefined,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    externalId: userData?.id ? String(userData.id) : undefined
                });

                toast.success('Account created successfully!');

                // Redirect based on role
                if (userData.role === 'admin' || userData.role === 'super_admin') {
                    router.push('/admin/dashboard');
                } else if (['dropshipper', 'sub_dropshipper', 'sub_sub_dropshipper'].includes(userData.role || '')) {
                    router.push('/dropshipper/dashboard');
                } else {
                    router.push('/customer/dashboard');
                }
            } else {
                const errorMsg = getErrorMessage(data);
                setError(errorMsg);
                toast.error(errorMsg);
                setShowErrorModal(true);
            }
        } catch (err) {
            const networkErrorMsg = 'Something went wrong. Please try again.';
            setError(networkErrorMsg);
            toast.error(networkErrorMsg);
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Customer Registration</h2>
                    <p className="text-gray-500 mt-2">Create your account to start shopping</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="name@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Mobile Number (BD) <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-gray-400 font-sans">013 - 019 (11 digits)</span>
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="tel"
                                maxLength={14}
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition font-sans"
                                placeholder="017XXXXXXXX"
                                value={phone_number}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600" required />
                            <span className="text-gray-600">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a></span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
                </p>
            </div>

            {/* Error Popup Modal */}
            {showErrorModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowErrorModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowErrorModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Error</h3>
                        <div className="bg-red-50 text-red-700 p-3.5 rounded-xl mb-6 text-sm font-medium whitespace-pre-line border border-red-100 text-left">
                            {error}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowErrorModal(false)}
                            className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-lg shadow-red-600/25"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
};

export default RegisterPage;
