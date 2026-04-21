"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Key,
    Wallet,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/dropshipper/login?redirect=' + pathname);
            } else {
                const isDropshipper = user.role === 'dropshipper' ||
                    user.role === 'sub_dropshipper' ||
                    user.role === 'sub_sub_dropshipper';
                if (!isDropshipper) {
                    router.push('/dropshipperform');
                }
            }
        }
    }, [user, loading, router, pathname]);

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning={true}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" suppressHydrationWarning={true}></div>
            </div>
        );
    }

    if (!user) return null;

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dropshipper/dashboard' },
        { name: 'Products', icon: Package, path: '/dropshipper/dashboard/products' },
        { name: 'API Management', icon: Key, path: '/dropshipper/dashboard/api-keys' },
        { name: 'My Orders', icon: ShoppingCart, path: '/dropshipper/dashboard/orders' },
        { name: 'My Children', icon: Users, path: '/dropshipper/dashboard/children' },
        { name: 'Wallet', icon: Wallet, path: '/dropshipper/dashboard/wallet' },
        { name: 'Profile Settings', icon: Settings, path: '/dropshipper/dashboard/profile' },
        { name: 'View My Store', icon: ExternalLink, path: 'EXTERNAL_STORE_LINK' }, // We'll replace this below
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" suppressHydrationWarning={true}>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Package size={24} /> ValoKichu
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Dropshipper Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        if (item.name === 'View My Store') {
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => window.open(`/store/${user?.refer_code}`, '_blank')}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                    <ChevronRight size={16} className="ml-auto opacity-50" />
                                </button>
                            );
                        }
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {isActive && <ChevronRight size={16} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h1 className="text-lg font-bold text-gray-800">
                        {menuItems.find(i => i.path === pathname)?.name || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {user?.first_name?.[0]}
                        </div>
                    </div>
                </header>

                {/* Page View */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
