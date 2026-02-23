"use client";

import React from 'react';
import Link from 'next/link';
import { Package, TrendingUp, Users, ShieldCheck, Zap, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DropshipperLandingPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform -translate-y-12"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Start Your Own <span className="text-blue-400">Dropshipping</span> Empire
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                            Join Valokichu's professional multi-level dropshipping portal.
                            Source 4,000+ products, set your margins, and build a network of sub-dropshippers to earn passive commission.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dropshipper/signup" className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-full font-bold text-center transition shadow-lg shadow-blue-500/20">
                                Start Now for Free
                            </Link>
                            <Link href="/dropshipper/login" className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-full font-bold text-center transition border border-white/30">
                                Dropshipper Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works - Multi-level Chain */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900">The Power of Multi-Level Dropshipping</h2>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Level 1: Dropshipper</h3>
                            <p className="text-gray-600">Enjoy 30% direct profit on sales and build your own network of sub-dropshippers.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Level 2: Sub-Dropshipper</h3>
                            <p className="text-gray-600">Earn 20% profit. Parent dropshippers earn a slice of every sale you make.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Level 3: Child Dropshipper</h3>
                            <p className="text-gray-600">Perfect for beginners. 10% direct margin with full technical support from the chain.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Robust API System</h4>
                                <p className="text-gray-600">Connect your platform with our secure HMAC-signed API. Supports pagination of 200 items.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Bot & IP Protection</h4>
                                <p className="text-gray-600">Our advanced IP logging and auto-ban system keeps your business safe from scrapers.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <Package size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-2">Inventory Management</h4>
                                <p className="text-gray-600">Real-time stock synchronization and easy product sourcing with auto-calculated margins.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to Scale Your Business?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of successful dropshippers using Valokichu to fulfill their orders worldwide.
                    </p>
                    <Link href="/dropshipper/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold transition inline-block text-lg shadow-xl shadow-blue-900/20">
                        Create Your Dropshipper Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default DropshipperLandingPage;
