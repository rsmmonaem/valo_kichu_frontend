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
    ShieldAlert,
    Activity,
    BarChart3,
    User,
    Newspaper
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const BLOGGER_ROLES = ['blogger', 'content_writer', 'blog_manager', 'blog_editor'];

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentType = searchParams.get('type');
    const isBlogger = !!(user && BLOGGER_ROLES.includes(user.role));

    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
        Orders: pathname.startsWith('/admin/orders'),
        Reports: pathname.startsWith('/admin/reports')
    });

    const [lastPathname, setLastPathname] = useState(pathname);
    if (pathname !== lastPathname) {
        setLastPathname(pathname);
        if (pathname.startsWith('/admin/orders')) {
            setOpenDropdowns(prev => ({ ...prev, Orders: true }));
        }
        if (pathname.startsWith('/admin/reports')) {
            setOpenDropdowns(prev => ({ ...prev, Reports: true }));
        }
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const hasPermission = (perm: string) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (user.role === 'admin') return perm !== 'users';
        if (user.permissions?.includes('*')) return true;
        if (isBlogger && perm === 'blogs') return true;
        return !!(user.permissions && user.permissions.includes(perm));
    };

    const allNavItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: hasPermission('orders') || hasPermission('products') || user?.role === 'admin' || user?.role === 'super_admin' },
        { path: '/admin/staff', label: 'Staff & Roles', icon: ShieldAlert, show: user?.role === 'super_admin' || hasPermission('users') },
        { path: '/admin/products', label: 'Products', icon: Package, show: hasPermission('products') },
        {
            label: 'Orders',
            icon: ShoppingCart,
            show: hasPermission('orders'),
            subItems: [
                { path: '/admin/orders?type=customer', label: 'Customer Orders' },
                { path: '/admin/orders?type=dropshipper', label: 'Dropshipper Orders' }
            ]
        },
        { path: '/admin/categories', label: 'Categories', icon: FolderTree, show: hasPermission('products') },
        { path: '/admin/sub-categories', label: 'Sub Categories', icon: Folder, show: hasPermission('products') },
        { path: '/admin/sub-sub-categories', label: 'Sub Sub Categories', icon: FolderOpen, show: hasPermission('products') },
        { path: '/admin/brands', label: 'Brands', icon: Tags, show: hasPermission('products') },
        { path: '/admin/banners', label: 'Banners', icon: ImageIcon, show: hasPermission('products') },
        { path: '/admin/blogs', label: 'Blogs', icon: Newspaper, show: hasPermission('blogs') },
        { path: '/admin/customers', label: 'Customers', icon: Users, show: hasPermission('customers') || hasPermission('orders') },
        { path: '/admin/checkout-leads', label: 'Checkout Leads', icon: ClipboardList, show: hasPermission('customers') || hasPermission('orders') },
        { path: '/admin/visitors', label: 'Visitors', icon: Activity, show: hasPermission('customers') || hasPermission('orders') },
        {
            label: 'Reports',
            icon: BarChart3,
            show: hasPermission('reports') || hasPermission('orders'),
            subItems: [
                { path: '/admin/reports/courier', label: 'Courier Reports' }
            ]
        },
        { path: '/admin/shipping', label: 'Shipping', icon: Truck, show: hasPermission('orders') },
        { path: '/admin/dropshippers', label: 'Dropshippers', icon: Users, show: hasPermission('dropshippers') },
        { path: '/admin/ip-logs', label: 'IP Logs & Limits', icon: ShieldAlert, show: hasPermission('settings') },
        { path: '/admin/settings', label: 'Global Settings', icon: Settings, show: hasPermission('settings') },
        { path: '/admin/home-settings', label: 'Home Settings', icon: LayoutDashboard, show: hasPermission('settings') },
        { path: '/admin/page-settings', label: 'Page Settings', icon: FileText, show: hasPermission('settings') },
        { path: '/admin/profile', label: 'Profile Settings', icon: User, show: true },
    ];

    const navItems = allNavItems.filter(item => item.show !== false);

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
                <div className="p-6 border-b border-slate-800/50 flex flex-col gap-2 bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <Link href={isBlogger ? "/admin/blogs" : "/admin/dashboard"} className="text-xl font-bold flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-blue-600 to-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                                <span className="text-white font-bold text-lg leading-none">V</span>
                            </div>
                            <span className="tracking-tight text-slate-100">Valokichu<span className="text-blue-500">.</span></span>
                        </Link>
                        <button onClick={() => setIsOpen(false)} aria-label="Close sidebar" className="md:hidden text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {isBlogger && (
                        <div className="flex items-center gap-1.5 mt-1 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[11px] font-semibold text-blue-300">Content Writer Access</span>
                        </div>
                    )}
                    {user?.role === 'super_admin' && (
                        <div className="flex items-center gap-1.5 mt-1 bg-rose-950/60 border border-rose-800/40 px-2.5 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            <span className="text-[11px] font-semibold text-rose-300">Super Administrator</span>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            if ('subItems' in item && item.subItems) {
                                const isOpenDropdown = !!openDropdowns[item.label];
                                const isAnySubActive = item.subItems.some(sub => {
                                    if (item.label === 'Orders') {
                                        const subType = sub.path.includes('type=customer') ? 'customer' : 'dropshipper';
                                        return pathname === '/admin/orders' && (currentType === subType || (subType === 'customer' && !currentType));
                                    }
                                    return pathname === sub.path || pathname.startsWith(sub.path);
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
                                                const isSubActive = item.label === 'Orders'
                                                    ? (pathname === '/admin/orders' && ((sub.path.includes('type=customer') && (currentType === 'customer' || !currentType)) || (sub.path.includes('type=dropshipper') && currentType === 'dropshipper')))
                                                    : (pathname === sub.path || pathname.startsWith(sub.path));
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
