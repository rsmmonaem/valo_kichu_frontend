"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Loader2,
  ChevronRight,
  Grid,
  ArrowRight,
  X,
} from "lucide-react";
import { Truck, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Category, getSearchSuggestions, SearchSuggestions } from "@/lib/api";
import CategoryDropdown from "./CategoryDropdown";
import MobileCategorySidebar from "./MobileCategorySidebar";
import CategoryBar from "./CategoryBar";
import AuthMenu from "./AuthMenu";
import { authFetch } from '@/lib/api';
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { trackSearch } from "@/lib/gtm";
import toast from "react-hot-toast";

interface HeaderProps {
  categories: Category[];
}

// ... imports
import { useSettings } from "@/context/SettingsContext";

import { useUI } from "@/context/UIContext";
import { getImageUrl } from "@/lib/utils";
// ... imports

const Header: React.FC<HeaderProps> = ({ categories }) => {
  const { settings } = useSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

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

  // Sync search state with URL param
  useEffect(() => {
    const currentParam = searchParams.get("search");
    if (currentParam !== null) {
      setSearch(currentParam);
    }
  }, [searchParams]);

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current?.contains(target);
      const insideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search suggestions (220ms)
  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSuggestions(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await getSearchSuggestions(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [search]);

  // Safe access to cart context
  const cartContext = useCart ? useCart() : { cartCount: 0 };
  const cartCount = cartContext?.cartCount || 0;
  const { wishlistCount } = useWishlist();

  const handleSearch = (customQuery?: string) => {
    const q = (typeof customQuery === "string" ? customQuery : search).trim();
    if (q) {
      setShowSuggestions(false);
      trackSearch(q);
      router.push(`/products?search=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const resolveSearchProductImage = (prod: { image?: string | null; image_url?: string | null }) => {
    const raw = prod.image_url || prod.image;
    if (!raw) return "/placeholder.png";
    const url = raw.trim();
    if (!url) return "/placeholder.png";

    if (url.startsWith("http")) {
      return getImageUrl(url.replace(/(\/api)(\/storage\/)/, "$2"));
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://backend.valokichu.com").replace(/\/api\/?$/, "");
    const cleanFilename = url.replace(/^\/?(storage\/products|products|storage)\/?/, "");
    return `${baseUrl}/storage/products/${cleanFilename}`;
  };

  const renderSuggestionsDropdown = () => {
    if (!showSuggestions || !search.trim()) return null;

    const hasProducts = suggestions && suggestions.products && suggestions.products.length > 0;
    const hasCategories = suggestions && suggestions.categories && suggestions.categories.length > 0;
    const hasKeywords = suggestions && suggestions.keywords && suggestions.keywords.length > 0;
    const hasResults = hasProducts || hasCategories || hasKeywords;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-hidden z-50 text-left animate-in fade-in-50 duration-150">
        {/* Loading status */}
        {isSearching && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 border-b border-gray-100 text-xs text-blue-600">
            <Loader2 size={13} className="animate-spin" />
            <span>Searching matching products...</span>
          </div>
        )}

        {/* Categories */}
        {hasCategories && (
          <div className="p-3 bg-gray-50/70 border-b border-gray-100">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Grid size={12} className="text-gray-400" />
              <span>Matching Categories</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions!.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    router.push(`/products?category=${cat.slug}`);
                  }}
                  className="text-xs px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-full border border-gray-200 transition-colors flex items-center gap-1 text-gray-700 shadow-sm"
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={12} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions keywords */}
        {hasKeywords && (
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs text-gray-600">
            <span className="text-[11px] font-medium text-gray-400 shrink-0">Related:</span>
            {suggestions!.keywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearch(kw);
                  handleSearch(kw);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 transition font-medium"
              >
                {kw}
              </button>
            ))}
          </div>
        )}

        {/* Products list */}
        {hasProducts && (
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {suggestions!.products.map((prod) => {
              const price = prod.sale_price ?? prod.base_price;
              const originalPrice = prod.sale_price ? prod.base_price : null;
              return (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50/60 transition group"
                  prefetch={false}
                >
                  <img
                    src={resolveSearchProductImage(prod)}
                    alt={prod.name}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0"
                    onError={(e) => {
                      (e.target as any).src = "https://placehold.co/100x100?text=Product";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate transition">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-blue-600">
                        ৳{Number(price).toLocaleString()}
                      </span>
                      {originalPrice && Number(originalPrice) > Number(price) && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{Number(originalPrice).toLocaleString()}
                        </span>
                      )}
                      {prod.category?.name && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {prod.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 shrink-0 transition" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isSearching && !hasResults && search.trim().length >= 2 && (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No products found for &ldquo;<span className="font-semibold text-gray-700">{search}</span>&rdquo;</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for chair, bag, watch, জুতা, ঘড়ি, ইত্যাদি।</p>
          </div>
        )}

        {/* Footer: View all button */}
        {search.trim().length > 0 && (
          <button
            type="button"
            onClick={() => handleSearch()}
            className="w-full p-2.5 bg-gray-50 hover:bg-blue-50 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition flex items-center justify-center gap-1.5 border-t border-gray-100"
          >
            <span>See all matching results for &ldquo;{search}&rdquo;</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
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
      if (user.is_approved === false) {
        toast.error("Your dropshipper account is pending admin approval. Please contact with admin for approval.");
      }
      router.push("/dropshipper/dashboard");
    } else {
      router.push("/dropshipper/signup");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-2 py-1 md:py-2">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-700"
                onClick={openSidebar}
                aria-label="Open navigation menu"
              >
                <Menu size={24} />
              </button>
              <Link href="/" className="flex items-center gap-2 shrink-0 group" prefetch={false}>
                {settings.site_logo ? (
                  <img
                    src={getImageUrl(settings.site_logo)}
                    alt={settings.site_name || "Valokichu Logo"}
                    width={180}
                    height={60}
                    className="h-14 md:h-20 w-auto group-hover:scale-105 transition-transform object-contain"
                  />
                ) : (
                  <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                    {settings.site_name ? settings.site_name.charAt(0) : "V"}
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block group">
              <div className="relative rounded-full border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Search for products (e.g. chair, ব্যাগ, watch, জুতা)..."
                  className="w-full pl-6 pr-24 py-3 bg-transparent focus:outline-none text-sm placeholder-gray-400 text-gray-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    if (search.trim()) setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Search products"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSuggestions(null);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-12 top-0 bottom-0 px-2 text-gray-400 hover:text-gray-600 flex items-center"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  aria-label="Search"
                  className="absolute right-0 top-0 bottom-0 bg-blue-600 text-white w-11 h-11 rounded-full hover:bg-blue-700 transition-transform hover:scale-105 flex items-center justify-center shadow-md shadow-blue-500/30"
                >
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>

              {renderSuggestionsDropdown()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
              <Link
                href="/track-order"
                className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group cursor-pointer"
                prefetch={false}
              >
                <div className="relative">
                  <MapPin
                    size={24}
                    className="group-hover:fill-blue-600/10 transition-colors"
                  />
                </div>
                <span className="text-[10px] font-medium hidden md:block">Track Order</span>
              </Link>
              <div
                className="relative text-gray-600 hover:text-green-600 transition-colors flex flex-col items-center gap-0.5 group cursor-pointer"
              >
                <div className="relative" onClick={() => dropShiperHandler()}>
                  <Truck
                    size={24}
                    className="group-hover:fill-green-600/10 transition-colors"
                  />
                  {/* <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span> */}
                </div>
                <span className="text-[10px] font-medium hidden md:block">Dropshipper</span>
              </div>
              <Link
                href="/wishlist"
                className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group"
                prefetch={false}
              >
                <div className="relative">
                  <Heart
                    size={24}
                    className="group-hover:fill-blue-600/10 transition-colors"
                  />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                </div>
                <span className="text-[10px] font-medium hidden md:block">Wishlist</span>
              </Link>

              <Link
                href="/cart"
                id="header-cart-icon"
                className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group"
                prefetch={false}
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
                <span className="text-[10px] font-medium hidden md:block">Cart</span>
              </Link>

              <AuthMenu />
            </div>
          </div>

          {/* Mobile Search Row (Daraz style) */}
          <div ref={mobileSearchContainerRef} className="md:hidden mt-1.5 pb-1 relative">
            <div className="relative rounded-full border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
              <input
                type="text"
                placeholder="Search products (e.g. chair, ব্যাগ, watch)..."
                className="w-full pl-4 pr-16 py-2 bg-transparent focus:outline-none text-xs placeholder-gray-400 text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim()) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                aria-label="Search products"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSuggestions(null);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-9 top-0 bottom-0 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSearch()}
                aria-label="Search"
                className="absolute right-0.5 top-0.5 bottom-0.5 bg-blue-600 text-white w-7 h-7 rounded-full hover:bg-blue-700 flex items-center justify-center shadow-sm"
              >
                {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              </button>
            </div>

            {renderSuggestionsDropdown()}
          </div>
        </div>

        {/* Categories Bar (Desktop) */}
        {false && (
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
        )}

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
