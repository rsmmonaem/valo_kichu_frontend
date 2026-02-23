"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/api';

const DropshipperLoginPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

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

                // Redirect based on role - for dropshipper login, we prioritize dropshipper dashboard
                if (userData.role === 'admin' || userData.role === 'super_admin') {
                    router.push('/admin/dashboard');
                } else if (['dropshipper', 'sub_dropshipper', 'sub_sub_dropshipper'].includes(userData.role || '')) {
                    router.push('/dropshipper/dashboard');
                } else {
                    router.push('/dropshipper/dashboard'); // Even if they are customers, if they used this login, they probably want the dashboard or to sign up
                }
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
                        <Truck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Dropshipper Login</h2>
                    <p className="text-gray-500 mt-2">Manage your business and network</p>
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
        </div>
    );
};

export default DropshipperLoginPage;
