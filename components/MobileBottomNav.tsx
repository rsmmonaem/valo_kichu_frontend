"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

import { useUI } from "@/context/UIContext";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { openSidebar } = useUI();
    // Safe access to cart context
    const cartContext = useCart ? useCart() : { cartCount: 0 };
    const cartCount = cartContext?.cartCount || 0;

    const handleNavClick = (e: React.MouseEvent, item: any) => {
        if (item.label === "Category") {
            e.preventDefault();
            openSidebar();
        }
    };

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Category", href: "/categories", icon: Grid }, // Assuming /categories page exists or similar
        { label: "Cart", href: "/cart", icon: ShoppingCart, count: cartCount },
        { label: "Wishlist", href: "/wishlist", icon: Heart },
        { label: "Account", href: "/login", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            <div className="relative">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
