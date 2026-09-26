"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Truck, Clock, X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/api';
import { trackLogin } from '@/lib/gtm';
import toast, { Toaster } from 'react-hot-toast';

const DropshipperLoginPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await authFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
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
                    userData = { name: 'User', email: email, id: 0 };
                }

                login(data.access_token, userData);

                // GA4: Track login
                trackLogin('email');

                // Redirect based on role - for dropshipper login, we prioritize dropshipper dashboard
                if (userData.role === 'admin' || userData.role === 'super_admin') {
                    router.push('/admin/dashboard');
                } else if (['dropshipper', 'sub_dropshipper', 'sub_sub_dropshipper'].includes(userData.role || '')) {
                    router.push('/dropshipper/dashboard');
                } else {
                    router.push('/dropshipper/dashboard');
                }
            } else {
                const isPending = data.is_approved === false ||
                    (data.error && typeof data.error === 'string' && data.error.toLowerCase().includes('approval')) ||
                    (data.message && typeof data.message === 'string' && data.message.toLowerCase().includes('approval'));

                if (isPending) {
                    const msg = "Your dropshipper account is pending admin approval. Please contact with admin for approval.";
                    setError(msg);
                    setApprovalMessage(msg);
                    setShowApprovalModal(true);
                    toast.error(msg, { duration: 6000 });
                } else {
                    const errorMsg = data.error || data.message || 'Invalid email or password';
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            }
        } catch (err) {
            const errMsg = 'Something went wrong. Please try again.';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
                        <Truck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Dropshipper Login</h2>
                    <p className="text-gray-500 mt-2">Manage your business and network.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                            <span className="text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In as Dropshipper'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600">
                    New to dropshipping? <Link href="/dropshipper/signup" className="text-blue-600 hover:text-blue-700 font-bold">Create Account</Link>
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                        Regular customer? Login here
                    </Link>
                </div>
            </div>

            {/* Admin Approval Pending Modal */}
            {showApprovalModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowApprovalModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-100 text-center relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowApprovalModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="animate-pulse" />
                        </div>
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2 border border-amber-200">
                            Approval Required
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pending Admin Approval</h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            {approvalMessage || 'Your dropshipper account is pending admin approval. Please contact with admin for approval.'}
                        </p>
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/8801898888062?text=Hello%20Admin,%20please%20approve%20my%20dropshipper%20account"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-lg shadow-emerald-600/20"
                            >
                                <MessageCircle size={18} /> Contact Admin on WhatsApp
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowApprovalModal(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-xl transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
};

export default DropshipperLoginPage;
