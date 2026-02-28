"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  Heart,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
} from "lucide-react";
import { Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category } from "@/lib/api";
import CategoryDropdown from "./CategoryDropdown";
import MobileCategorySidebar from "./MobileCategorySidebar";
import CategoryBar from "./CategoryBar";
import AuthMenu from "./AuthMenu";
import { authFetch } from '@/lib/api';
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  categories: Category[];
}

// ... imports
import { useSettings } from "@/context/SettingsContext";

import { useUI } from "@/context/UIContext";
// ... imports

const Header: React.FC<HeaderProps> = ({ categories }) => {
  const { settings } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const { isSidebarOpen, closeSidebar, openSidebar } = useUI();

  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const code = localStorage.getItem('referral_code');
    if (code) setReferralCode(code);

    const handleStorage = () => {
      setReferralCode(localStorage.getItem('referral_code'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);


  // Safe access to cart context
  const cartContext = useCart ? useCart() : { cartCount: 0 };
  const cartCount = cartContext?.cartCount || 0;

  // ... (keep handleSearch etc)

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


  async function dropShiperHandler() {
    if (!user) {
      router.push("/dropshipper/login?redirect=/dropshipper/dashboard");
      return;
    }

    const isDropshipper = user.role === 'dropshipper' ||
      user.role === 'sub_dropshipper' ||
      user.role === 'sub_sub_dropshipper';

    if (isDropshipper) {
      router.push("/dropshipper/dashboard");
    } else {
      router.push("/dropshipperform");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                onClick={openSidebar}
              >
                <Menu size={24} />
              </button>
              <Link href="/" className="flex items-center gap-2 shrink-0 group">
                {settings.site_logo ? (
                  <img
                    src={
                      settings.site_logo.startsWith("http")
                        ? settings.site_logo
                        : `${process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:8000"
                        }/storage/${settings.site_logo}`
                    }
                    alt={settings.site_name || "Logo"}
                    className="h-14 md:h-20 w-auto group-hover:scale-105 transition-transform object-contain"
                  />
                ) : (
                  <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                    {/* {settings.site_name ? settings.site_name.charAt(0) : "V"} */}
                    <img
                      src={`/fav1.png`}
                      alt={settings.site_name || "Logo"}
                      className="h-10 w-auto group-hover:scale-105 transition-transform object-contain"
                    />
                  </div>
                )}
              </Link>
              {referralCode && (
                <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight">Partner: {referralCode}</span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative hidden md:block group">
              <div className="relative overflow-hidden rounded-full border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-6 pr-14 py-3 bg-transparent focus:outline-none text-sm placeholder-gray-400 text-gray-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-0 top-0 bottom-1 bg-blue-600 text-white w-11 h-11 rounded-full hover:bg-blue-700 transition-transform hover:scale-105 flex items-center justify-center shadow-md shadow-blue-500/30"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div

                className="relative text-gray-600 hover:text-green-600 transition-colors flex flex-col items-center gap-0.5 group hidden md:block md:flex cursor-pointer"
              >
                <div className="relative" onClick={() => dropShiperHandler()}>
                  <Truck
                    size={24}
                    className="group-hover:fill-green-600/10 transition-colors"
                  />
                  {/* <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span> */}
                </div>
                <span className="text-[10px] font-medium">Dropshipper</span>
              </div>
              <Link
                href="/wishlist"
                className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group"
              >
                <div className="relative">
                  <Heart
                    size={24}
                    className="group-hover:fill-blue-600/10 transition-colors"
                  />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    0
                  </span>
                </div>
                <span className="text-[10px] font-medium">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group"
              >
                <div className="relative">
                  <ShoppingCart
                    size={24}
                    className="group-hover:fill-blue-600/10 transition-colors"
                  />
                  {cartCount > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                      {0}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Cart</span>
              </Link>

              <AuthMenu />
            </div>
          </div>
        </div>

        {/* Categories Bar (Desktop) */}
        <div className="border-t border-gray-100 bg-white hidden md:block relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 py-2 text-sm font-medium text-gray-700">
              {/* All Categories Dropdown Trigger */}
              <div className="relative group cursor-pointer z-50">
                <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                  <Menu size={18} />
                  <span>Categories</span>
                  <ChevronDown size={14} />
                </div>
                <CategoryDropdown categories={categories} />
              </div>

              {/* Dynamic Category Bar */}
              <CategoryBar />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Category Sidebar */}
      <MobileCategorySidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        categories={categories}
      />
    </>
  );
};

export default Header;
