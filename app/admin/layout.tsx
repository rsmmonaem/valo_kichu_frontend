"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';
import { Menu } from 'lucide-react';

const ALLOWED_ADMIN_ROLES = ['admin', 'super_admin', 'child_admin', 'blogger', 'content_writer', 'blog_manager', 'blog_editor'];
const BLOGGER_ROLES = ['blogger', 'content_writer', 'blog_manager', 'blog_editor'];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!ALLOWED_ADMIN_ROLES.includes(user.role)) {
                router.push('/');
            } else if (BLOGGER_ROLES.includes(user.role)) {
                // If user is a blogger, restrict them strictly to blogs and profile
                const isAllowedPage = pathname.startsWith('/admin/blogs') || pathname.startsWith('/admin/profile');
                if (!isAllowedPage) {
                    router.replace('/admin/blogs');
                }
            }
        }
    }, [loading, user, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading Panel...</p>
            </div>
        );
    }

    if (!user || !ALLOWED_ADMIN_ROLES.includes(user.role)) {
        return null;
    }

    const isBlogger = BLOGGER_ROLES.includes(user.role);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-800">
                            {isBlogger ? 'Blog Management' : 'Admin Panel'}
                        </span>
                    </div>
                    {isBlogger && (
                        <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Content Writer
                        </span>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

