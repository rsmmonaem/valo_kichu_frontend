"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, Ticket, TrendingUp, AlertCircle, X, Clock, MessageCircle, LogOut } from 'lucide-react';
import { authFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import * as fpixel from '@/lib/fpixel';
import { trackSignUp, trackGenerateLead } from '@/lib/gtm';
import toast, { Toaster } from 'react-hot-toast';

const DropshipperSignupPage = () => {
    const { user, login, logout } = useAuth();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate actual email format
        const trimmedEmail = (formData.email || '').trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
            const msg = "Please enter a valid email address (e.g. name@gmail.com)";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        // 2. Validate actual Bangladeshi phone number
        let cleanPhone = (formData.phone_number || '').trim().replace(/[\s-]/g, '');
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

        if (formData.password !== formData.confirm_password) {
            const msg = "Passwords do not match";
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
            return;
        }

        if (formData.password.length < 6) {
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
                    ...formData,
                    email: trimmedEmail,
                    phone_number: cleanPhone,
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

                // Unified GA4 & Meta Pixel: Track CompleteRegistration and Lead
                const signupUserData = {
                    email: formData.email || undefined,
                    phone: formData.phone_number || undefined,
                    firstName: formData.first_name || undefined,
                    lastName: formData.last_name || undefined,
                    externalId: userData?.id ? String(userData.id) : undefined
                };

                trackSignUp('email', signupUserData);
                trackGenerateLead('Dropshipper Signup', undefined, 'BDT', signupUserData);

                toast.success('Registration successful!');
                router.push('/dropshipper/dashboard');
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

    const isDropshipper = Boolean(user && (user.role === 'dropshipper' ||
        user.role === 'sub_dropshipper' ||
        user.role === 'sub_sub_dropshipper' ||
        Boolean((user as any).is_any_dropshipper)));

    const [isApplyingExisting, setIsApplyingExisting] = useState(false);

    const handleApplyExisting = async () => {
        setIsApplyingExisting(true);
        setError('');
        try {
            const res = await authFetch('/dropshipper/apply', {
                method: 'POST',
                body: JSON.stringify({ referral_code: formData.referral_code })
            });
            const data = await res.json();
            if (res.ok) {
                const userRes = await authFetch('/v1/auth/user');
                if (userRes.ok) {
                    const refreshed = await userRes.json();
                    login(localStorage.getItem('token') || '', refreshed.data || refreshed);
                } else if (data.user) {
                    login(localStorage.getItem('token') || '', data.user);
                }
                toast.success('Dropshipper application submitted!');
            } else {
                const msg = data.error || data.message || 'Failed to submit application.';
                setError(msg);
                toast.error(msg);
                setShowErrorModal(true);
            }
        } catch (e) {
            const msg = 'Something went wrong. Please try again.';
            setError(msg);
            toast.error(msg);
            setShowErrorModal(true);
        } finally {
            setIsApplyingExisting(false);
        }
    };

    // Auto-fill existing customer info
    useEffect(() => {
        if (user && !formData.email && !formData.phone_number) {
            setFormData(prev => ({
                ...prev,
                first_name: prev.first_name || user.first_name || (user.name ? user.name.split(' ')[0] : ''),
                last_name: prev.last_name || user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
                email: prev.email || user.email || '',
                phone_number: prev.phone_number || user.phone_number || '',
            }));
        }
    }, [user]);

    // If user is already approved dropshipper, redirect to dashboard
    useEffect(() => {
        if (isDropshipper && user?.is_approved) {
            router.push('/dropshipper/dashboard');
        }
    }, [isDropshipper, user, router]);

    // If user is dropshipper but pending approval, show pending approval notice
    if (isDropshipper && user?.is_approved === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-amber-100 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Clock size={40} className="animate-pulse" />
                    </div>
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2 border border-amber-200">
                        Pending Admin Approval
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Account Under Review</h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        You have already registered with <strong>{user.email || user.phone_number}</strong>. Your dropshipper account is pending admin approval. Please contact with admin for approval.
                    </p>
                    <div className="space-y-3">
                        <a
                            href="https://wa.me/8801898888062?text=Hello%20Admin,%20please%20approve%20my%20dropshipper%20account"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg shadow-emerald-600/20"
                        >
                            <MessageCircle size={18} /> Contact Admin on WhatsApp
                        </a>
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If logged in as Customer (not dropshipper), provide 1-click apply option instead of duplicate signup
    if (user && !isDropshipper) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-blue-100 text-center">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <TrendingUp size={40} />
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2 border border-blue-200">
                        Existing Account Found
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Become a Dropshipper</h2>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        You are logged in with <strong>{user.email || user.phone_number}</strong>. Apply to activate your Dropshipper account without creating a new email.
                    </p>

                    <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-6 text-left">
                        <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                            <Ticket size={14} /> Referral Code (Optional)
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition uppercase text-sm bg-white"
                            placeholder="INVITE CODE"
                            value={formData.referral_code}
                            onChange={(e) => setFormData(prev => ({ ...prev, referral_code: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-3">
                        <a
                            href={`https://wa.me/8801898888062?text=${encodeURIComponent(`Hello Admin, please activate my account (${user.email || user.phone_number}) as a Dropshipper.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-600/25"
                        >
                            <MessageCircle size={18} /> Contact Admin on WhatsApp to Activate
                        </a>
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-2xl transition"
                        >
                            <LogOut size={18} /> Sign In with Different Account
                        </button>
                    </div>
                </div>
                <Toaster position="top-center" />
            </div>
        );
    }

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

export default DropshipperSignupPage;
