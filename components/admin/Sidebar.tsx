"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    X,
    FolderTree,
    Folder,
    FolderOpen,
    Tags,
    Image as ImageIcon,
    Truck,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    FileText,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentType = searchParams.get('type');

    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
        Orders: pathname.startsWith('/admin/orders')
    });

    const [lastPathname, setLastPathname] = useState(pathname);
    if (pathname !== lastPathname) {
        setLastPathname(pathname);
        if (pathname.startsWith('/admin/orders')) {
            setOpenDropdowns(prev => ({ ...prev, Orders: true }));
        }
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        {
            label: 'Orders',
            icon: ShoppingCart,
            subItems: [
                { path: '/admin/orders?type=customer', label: 'Customer Orders' },
                { path: '/admin/orders?type=dropshipper', label: 'Dropshipper Orders' }
            ]
        },
        { path: '/admin/categories', label: 'Categories', icon: FolderTree },
        { path: '/admin/sub-categories', label: 'Sub Categories', icon: Folder },
        { path: '/admin/sub-sub-categories', label: 'Sub Sub Categories', icon: FolderOpen },
        { path: '/admin/brands', label: 'Brands', icon: Tags },
        { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/checkout-leads', label: 'Checkout Leads', icon: ClipboardList },
        { path: '/admin/shipping', label: 'Shipping', icon: Truck },
        { path: '/admin/dropshippers', label: 'Dropshippers', icon: Users },
        { path: '/admin/ip-logs', label: 'IP Logs & Limits', icon: ShieldAlert },
        { path: '/admin/settings', label: 'Global Settings', icon: Settings },
        { path: '/admin/home-settings', label: 'Home Settings', icon: LayoutDashboard },
        { path: '/admin/page-settings', label: 'Page Settings', icon: FileText },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white w-64 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen flex flex-col shadow-xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                    <Link href="/admin/dashboard" className="text-xl font-bold flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                            <span className="text-white font-bold text-lg leading-none">V</span>
                        </div>
                        <span className="tracking-tight text-slate-100">Valokichu<span className="text-blue-500">.</span></span>
                    </Link>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            if ('subItems' in item && item.subItems) {
                                const isOpenDropdown = !!openDropdowns[item.label];
                                const isAnySubActive = item.subItems.some(sub => {
                                    const subType = sub.path.includes('type=customer') ? 'customer' : 'dropshipper';
                                    return pathname === '/admin/orders' && (currentType === subType || (subType === 'customer' && !currentType));
                                });
                                return (
                                    <div key={item.label} className="space-y-1">
                                        <button
                                            onClick={() => {
                                                setOpenDropdowns(prev => ({
                                                    ...prev,
                                                    [item.label]: !prev[item.label]
                                                }));
                                            }}
                                            className={clsx(
                                                "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                                isAnySubActive
                                                    ? "bg-slate-800 text-white"
                                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <item.icon size={18} className={clsx("transition-transform group-hover:scale-110", isAnySubActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isOpenDropdown ? <ChevronDown size={16} className="text-slate-400 group-hover:text-white relative z-10" /> : <ChevronRight size={16} className="text-slate-400 group-hover:text-white relative z-10" />}
                                        </button>

                                        {/* Sub Items */}
                                        <div className={clsx(
                                            "pl-8 space-y-1 transition-all duration-200 overflow-hidden",
                                            isOpenDropdown ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                                        )}>
                                            {item.subItems.map((sub) => {
                                                const subType = sub.path.includes('type=customer') ? 'customer' : 'dropshipper';
                                                const isSubActive = pathname === '/admin/orders' && (currentType === subType || (subType === 'customer' && !currentType));
                                                return (
                                                    <Link
                                                        key={sub.path}
                                                        href={sub.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={clsx(
                                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative overflow-hidden",
                                                            isSubActive
                                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                        )}
                                                    >
                                                        <span className="relative z-10">{sub.label}</span>
                                                        {isSubActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            const isActive = pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                    )}
                                >
                                    <item.icon size={18} className={clsx("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                    <span className="relative z-10">{item.label}</span>
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
