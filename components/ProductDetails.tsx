"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  RotateCcw,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Product } from "@/lib/api";
import { parseAttributes, parseGalleryImages, getImageUrl } from "@/lib/utils";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddtocartToster from "./AddtocartToster";
import { formatProductDescriptionUniversal } from "@/lib/utils/formatProductDescription";
import { formatAmount } from "@/lib/utils/formatAmount";
import * as fpixel from "@/lib/fpixel";
import { getDefaultColor } from "@/lib/utils/getDefaultColorImage";
import { trackViewItem, mapProductToGAItem } from "@/lib/gtm";
import { flyToCart } from "@/lib/utils/flyToCart";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { cart = [], addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImageOverride, setMainImageOverride] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  // Variations State
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Standardize the API base URL to remove /api for storage links
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');

  // Use backend provided full URLs if available, else construct manually
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    let cleanUrl = url;
    if (!url.startsWith('http')) {
      cleanUrl = `${baseUrl}/storage/products/${url.replace(/^\/?(storage\/products|products)\/?/, '')}`;
    }

    return getImageUrl(cleanUrl);
  };

  const getVariationAttr = (v: any, attrName: string): string => {
    if (!v) return '';
    let attrs = v.attributes || {};
    if (typeof attrs === 'string') {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = {};
      }
    }
    const foundKey = Object.keys(attrs).find(k => k.toLowerCase() === attrName.toLowerCase());
    return foundKey ? String(attrs[foundKey]) : '';
  };

  const mainImage = resolveImageUrl(product.image_url || ((typeof product.images === 'string') ? product.images : '') || product.image || '');
  // Safe parsing of product.variations and product.colors (handling potential JSON string or array or object)
  const parsedVariations = useMemo(() => {
    if (!product.variations) return [];
    if (typeof product.variations === 'string') {
      try {
        const parsed = JSON.parse(product.variations);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
  }, [product.variations]);

  const parsedColors = useMemo(() => {
    if (!product.colors) return [];
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.colors) ? product.colors : Object.values(product.colors);
  }, [product.colors]);

  const galleryArray = parseGalleryImages(product.gallery_images) || [];
  const productAttributes = parseAttributes(product.attributes) || [];

  const allImages = product.gallery_image_urls && product.gallery_image_urls.length > 0
    ? product.gallery_image_urls.map((img: string) => resolveImageUrl(img))
    : (galleryArray.length > 0
      ? galleryArray.map((img: string) => resolveImageUrl(img))
      : [mainImage]);

  // Extract size, color, weight from attributes + product data
  // For colors: prefer product.colors field, then fall back to attributes
  const colorData = useMemo(() => {
    let colors = [];
    if (parsedColors.length > 0) {
      colors = parsedColors.map((c: any, idx: number) => ({
        id: c.id || idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || c?.color_image || ""),
        priority: c.priority ?? null,
      }));
    } else {
      colors = productAttributes
        .find((a) => a.name?.toLowerCase() === "color")
        ?.values.map((c: any, idx: number) => ({
          id: idx + 1,
          name: typeof c === "string" ? c : c.name || "",
          img: resolveImageUrl(c?.image || ""),
          priority: null,
        })) || [];
    }
    // Sort colors based on priority (lowest number first, e.g. 1, 2, 3...)
    // Colors without priority come last
    return [...colors].sort((a, b) => {
      const aPriority = a.priority !== null && a.priority !== undefined && !isNaN(Number(a.priority)) ? Number(a.priority) : Infinity;
      const bPriority = b.priority !== null && b.priority !== undefined && !isNaN(Number(b.priority)) ? Number(b.priority) : Infinity;
      if (aPriority === bPriority) return 0;
      return aPriority - bPriority;
    });
  }, [parsedColors, productAttributes]);

  // For sizes: merge from attributes AND variations
  const attrSizes =
    productAttributes.find((a) => a.name?.toLowerCase() === "size")?.values || [];
  const variationSizes = parsedVariations.length > 0
    ? [...new Set(parsedVariations.map((v: any) => v.size || getVariationAttr(v, 'size')).filter(Boolean))]
    : [];
  const sizeData = attrSizes.length > 0
    ? [...new Set([...attrSizes, ...variationSizes])]
    : variationSizes;

  // For weight: merge from attributes AND variations
  const attrWeights =
    productAttributes
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || ""),
      })) || [];
  const variationWeightNames = parsedVariations.length > 0
    ? [...new Set(parsedVariations.map((v: any) => v.weight || getVariationAttr(v, 'weight')).filter(Boolean))]
    : [];
  const weightData = attrWeights.length > 0
    ? attrWeights
    : variationWeightNames.map((w: any, idx: number) => ({ id: idx + 1, name: w, img: "" }));

  // Track recently viewed products
  useEffect(() => {
    if (product && product.slug) {
      try {
        let history = JSON.parse(localStorage.getItem('valo_kichu_history') || '[]');
        // Remove current if exists to push to top
        history = history.filter((slug: string) => slug !== product.slug);
        history.unshift(product.slug);
        // Keep only last 10
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('valo_kichu_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error tracking history', e);
      }
    }
  }, [product]);

  useEffect(() => {
    // Parse and set Initial Attributes
    const parsedAttrs = parseAttributes(product.attributes) || [];
    setAttributes(parsedAttrs);

    // Set Defaults - colors from parsedColors or attributes
    const colorsFromAttrs =
      parsedAttrs.find((a) => a.name.toLowerCase() === "color")?.values || [];
    if (parsedColors.length > 0) {
      // Find the color with lowest priority value (1 = default)
      const defaultColorRaw = getDefaultColor(parsedColors);
      const firstColor = defaultColorRaw || parsedColors[0];
      const defaultColorObj = {
        id: firstColor.id || 0,
        name: typeof firstColor === "string" ? firstColor : firstColor.name,
        img: resolveImageUrl(firstColor.image || firstColor.color_image || ""),
        priority: firstColor.priority ?? null,
      };
      setSelectedColor(defaultColorObj);
      // If the default color has an image, show it as the main image
      if (defaultColorObj.img) {
        setMainImageOverride(defaultColorObj.img);
      }
    } else if (colorsFromAttrs.length > 0) {
      const firstColor = colorsFromAttrs[0];
      setSelectedColor({
        id: 0,
        name: typeof firstColor === "string" ? firstColor : firstColor.name,
        img: resolveImageUrl(firstColor.image || ""),
        priority: null,
      });
    } else {
      setSelectedColor(null);
    }

    const attrSizesInit =
      parsedAttrs.find((a) => a.name.toLowerCase() === "size")?.values || [];
    const varSizesInit = parsedVariations.length > 0
      ? [...new Set(parsedVariations.map((v: any) => v.size || getVariationAttr(v, 'size')).filter(Boolean))]
      : [];
    const allSizesInit = attrSizesInit.length > 0
      ? [...new Set([...attrSizesInit, ...varSizesInit])]
      : varSizesInit;
    if (allSizesInit.length > 0) {
      setSelectedSize(allSizesInit[0]);
    } else {
      setSelectedSize(null);
    }

    const attrWeightsLocal = parsedAttrs
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || ""),
      })) || [];
    const variationWeightNamesLocal = parsedVariations.length > 0
      ? [...new Set(parsedVariations.map((v: any) => v.weight || getVariationAttr(v, 'weight')).filter(Boolean))]
      : [];
    const weightDataLocal = attrWeightsLocal.length > 0
      ? attrWeightsLocal
      : variationWeightNamesLocal.map((w: any, idx: number) => ({ id: idx + 1, name: w, img: "" }));

    if (weightDataLocal.length > 0) {
      setSelectedWeight(weightDataLocal[0]);
    } else {
      setSelectedWeight(null);
    }
  }, [product, parsedColors, parsedVariations]);

  const basePrice = parseFloat(product.base_price || product.price || "0");
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;

  // --- Find matched variation based on current selections ---
  const getMatchedVariation = () => {
    if (parsedVariations.length === 0) return null;
    const selectedColorName = (typeof selectedColor === 'string' ? selectedColor : selectedColor?.name || '').toLowerCase();
    const selectedSizeName = (typeof selectedSize === 'string' ? selectedSize : selectedSize?.name || '').toLowerCase();
    const selectedWeightName = (typeof selectedWeight === 'string' ? selectedWeight : selectedWeight?.name || '').toLowerCase();

    return parsedVariations.find((v: any) => {
      // Color matching: support direct v.color or nested color
      const variationColorName = (v.color || getVariationAttr(v, 'color') || '').toLowerCase();
      const colorMatch = !variationColorName || variationColorName === selectedColorName;

      // Size matching: support direct v.size or nested attributes.Size
      const variationSize = (v.size || getVariationAttr(v, 'size') || '').toLowerCase();
      const sizeMatch = !variationSize || variationSize === selectedSizeName;

      // Weight matching: support direct v.weight or nested attributes.Weight
      const variationWeight = (v.weight || getVariationAttr(v, 'weight') || '').toLowerCase();
      const weightMatch = !variationWeight || variationWeight === selectedWeightName;

      return colorMatch && sizeMatch && weightMatch;
    });
  };

  // --- Variation-wise price logic ---
  const getVariationPrice = (): number | null => {
    const matchedVariation = getMatchedVariation();
    if (matchedVariation) {
      const finalPrice = matchedVariation.price !== undefined ? parseFloat(matchedVariation.price) : null;
      if (finalPrice !== null && finalPrice > 0) {
        return finalPrice;
      }
    }
    return null;
  };

  const variationPrice = getVariationPrice();
  // Use variation price if found, else fall back to discount/base price
  const displayPrice = variationPrice !== null ? variationPrice : (hasDiscount ? salePrice! : basePrice);

  useEffect(() => {
    if (product && product.id) {
      // Unified GA4 view_item and Meta Pixel ViewContent
      const matchedVariation = getMatchedVariation();
      const variantInfo = {
        color: selectedColor?.name,
        size: selectedSize,
        weight: typeof selectedWeight === "string" ? selectedWeight : selectedWeight?.name || ""
      };
      const gaItem = mapProductToGAItem(product, undefined, quantity, variantInfo);
      gaItem.price = Number(displayPrice || gaItem.price || 0);
      trackViewItem(gaItem, Number(displayPrice || 0));
    }
  }, [product.id, product.name, product.category?.name, displayPrice]);


  const handleAddToCart = (redirect = false, targetEl?: HTMLElement | null) => {
    const matchedVariation = getMatchedVariation();
    const variantId = matchedVariation?.id || [
      typeof selectedColor === 'string' ? selectedColor : selectedColor?.name || '',
      selectedSize || '',
      typeof selectedWeight === 'string' ? selectedWeight : selectedWeight?.name || ''
    ].filter(Boolean).join('-');

    const itemToAdd = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: mainImageOverride || mainImage,
      quantity: quantity,
      variant: {
        id: variantId,
        color: selectedColor?.name,
        size: selectedSize,
        weight: typeof selectedWeight === "string" ? selectedWeight : selectedWeight?.name || "",
      },
      bulk_discount_rules: product.bulk_discount_rules,
    };

    addToCart(itemToAdd);

    // Trigger laser trail + flying particle animation to cart icon
    if (!redirect) {
      flyToCart(targetEl);
      setShowCartAnimation(true);
      setTimeout(() => {
        setShowCartAnimation(false);
      }, 2200);
    }

    if (redirect) {
      router.push("/checkout");
    }
  };

  const resolveProductImageUrl = (rawImage: string | null | undefined) => {
    if (!rawImage) return "";
    if (rawImage.startsWith("http")) return rawImage;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
    return `${baseUrl}/storage/products/${rawImage.replace(/^\/?(storage\/products|products)\/?/, '')}`;
  };
  const prevImageUrl = resolveProductImageUrl(product.prev_image);
  const nextImageUrl = resolveProductImageUrl(product.next_image);

  // Calculate dynamic bulk discount preview for quantity selector
  let activeBulkDiscountPerItem = 0;
  if (product.bulk_discount_rules && Array.isArray(product.bulk_discount_rules)) {
    for (const rule of product.bulk_discount_rules) {
      const minQty = Number(rule.min_qty) || 0;
      const discAmt = Number(rule.discount_amount) || 0;
      if (minQty > 0 && quantity >= minQty) {
        activeBulkDiscountPerItem = Math.max(activeBulkDiscountPerItem, discAmt);
      }
    }
  }
  const previewUnitPrice = Math.max(0, displayPrice - activeBulkDiscountPerItem);

  const productCartItems = cart.filter((item) => item.id === product.id);
  const totalCartQuantity = productCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total Price = (total variant count in cart * product price), or (quantity * product price) if cart is empty
  const previewTotalPrice = totalCartQuantity > 0
    ? totalCartQuantity * previewUnitPrice
    : quantity * previewUnitPrice;

  // Cart items helper for selected color (associated sizes in cart)
  const cartSizesForSelectedColor = useMemo(() => {
    const colorName = selectedColor?.name || (typeof selectedColor === 'string' ? selectedColor : '');
    if (!colorName) return '';
    const items = cart.filter(
      (item) => item.id === product.id && item.variant?.color === colorName && item.variant?.size
    );
    if (items.length === 0) return '';
    return items.map((item) => `${item.variant?.size}${item.quantity > 1 ? ` (${item.quantity})` : ''}`).join(', ');
  }, [cart, product.id, selectedColor]);

  // Cart items helper for selected size (associated colors in cart)
  const cartColorsForSelectedSize = useMemo(() => {
    if (!selectedSize) return '';
    const items = cart.filter(
      (item) => item.id === product.id && item.variant?.size === selectedSize && item.variant?.color
    );
    if (items.length === 0) return '';
    return items.map((item) => `${item.variant?.color}${item.quantity > 1 ? ` (${item.quantity})` : ''}`).join(', ');
  }, [cart, product.id, selectedSize]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Mobile-only Title Header (Above Image Slider) */}
      <div className="block md:hidden px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            {product.category?.name || "Store Item"}
          </span>
          {product.product_code && (
            <span className="text-gray-500 font-bold text-[9px] uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              Code: {product.product_code}
            </span>
          )}
        </div>
        <h1 className="text-lg font-bold text-gray-900 leading-snug mb-1.5">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 text-xs mb-2">
          <div className="flex items-center text-yellow-500 gap-1">
            <Star size={14} fill="currentColor" />
            <span className="font-bold text-gray-900">4.8</span>
            <span className="text-gray-400 text-xs">(120 Reviews)</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-green-600 font-medium text-xs">In Stock</span>
        </div>

        {/* Mobile Price: Placed directly below 4.8 (120 Reviews) | In Stock */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-bold text-blue-600">
            ৳{formatAmount(displayPrice)}
          </span>
          {(variationPrice !== null || hasDiscount) && displayPrice < basePrice && (
            <span className="text-sm text-gray-400 line-through">
              ৳{formatAmount(basePrice)}
            </span>
          )}
          {hasDiscount && variationPrice === null && (
            <span className="text-sm text-gray-400 line-through">
              ৳{formatAmount(basePrice)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
        {/* Image Gallery */}
        <div className="p-2 md:p-8 bg-white">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 relative group/gallery">
            {allImages.length > 0 ? (
              <Image
                src={mainImageOverride || allImages[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-2.5 bg-white/95 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md z-20 transition duration-300 backdrop-blur-sm cursor-pointer hover:scale-105"
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"}`}
              />
            </button>

            {/* Prev/Next Navigation Arrows inside Image */}
            {(colorData.length > 1 || allImages.length > 1) && (
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between px-3 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (colorData.length > 1) {
                      const curName = (selectedColor?.name || selectedColor || '').toString().toLowerCase();
                      const currentIndex = colorData.findIndex((c: any) => c.name.toLowerCase() === curName);
                      const nextIndex = currentIndex <= 0 ? colorData.length - 1 : currentIndex - 1;
                      const newColor = colorData[nextIndex];
                      setSelectedColor(newColor);
                      if (newColor.img) setMainImageOverride(newColor.img);
                    } else {
                      setMainImageOverride(null);
                      setSelectedImage((prev) => (prev <= 0 ? allImages.length - 1 : prev - 1));
                    }
                  }}
                  className="pointer-events-auto flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/95 hover:bg-white text-gray-800 hover:text-blue-600 rounded-full border border-gray-150 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={18} className="mr-0.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (colorData.length > 1) {
                      const curName = (selectedColor?.name || selectedColor || '').toString().toLowerCase();
                      const currentIndex = colorData.findIndex((c: any) => c.name.toLowerCase() === curName);
                      const nextIndex = currentIndex === -1 || currentIndex >= colorData.length - 1 ? 0 : currentIndex + 1;
                      const newColor = colorData[nextIndex];
                      setSelectedColor(newColor);
                      if (newColor.img) setMainImageOverride(newColor.img);
                    } else {
                      setMainImageOverride(null);
                      setSelectedImage((prev) => (prev >= allImages.length - 1 ? 0 : prev + 1));
                    }
                  }}
                  className="pointer-events-auto flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/95 hover:bg-white text-gray-800 hover:text-blue-600 rounded-full border border-gray-150 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={18} className="ml-0.5" />
                </button>
              </div>
            )}

            {hasDiscount && salePrice && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-lg">
                -{Math.round(((basePrice - salePrice) / basePrice) * 100)}%
              </div>
            )}
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImage(idx);
                  setMainImageOverride(null);
                }}
                className={clsx(
                  "w-14 h-14 md:w-18 md:h-18 flex shrink-0 rounded-lg overflow-hidden border-2 transition",
                  selectedImage === idx && !mainImageOverride
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>


        </div>

        {/* Product Info */}
        <div className="p-4 md:p-8 bg-gray-50 md:bg-white flex flex-col">
          {/* Desktop Title & Details Header */}
          <div className="hidden md:flex items-center gap-2 mb-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
              {product.category?.name || "Store Item"}
            </span>
            {product.product_code && (
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded border border-gray-200">
                Code: {product.product_code}
              </span>
            )}
          </div>
          <h1 className="hidden md:block text-2xl lg:text-3xl font-bold text-gray-900 mb-2.5 leading-tight">
            {product.name}
          </h1>

          <div className="hidden md:flex items-center gap-4 mb-4">
            <div className="flex items-center text-yellow-500 gap-1">
              <Star size={16} fill="currentColor" />
              <span className="font-bold text-gray-900">4.8</span>
              <span className="text-gray-400 text-sm">(120 Reviews)</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-green-600 font-medium text-sm">In Stock</span>
          </div>

          {/* Desktop Price (Mobile price is directly below rating) */}
          <div className="hidden md:flex items-baseline gap-3 mb-3">
            <span className="text-2xl md:text-3xl font-bold text-blue-600">
              ৳{formatAmount(displayPrice)}
            </span>
            {/* Show original base price as strikethrough if variation price or sale price applies */}
            {(variationPrice !== null || hasDiscount) && displayPrice < basePrice && (
              <span className="text-base md:text-lg text-gray-400 line-through">
                ৳{formatAmount(basePrice)}
              </span>
            )}
            {hasDiscount && variationPrice === null && (
              <span className="text-base md:text-lg text-gray-400 line-through">
                ৳{formatAmount(basePrice)}
              </span>
            )}
          </div>

          {/* Bulk Discount Offers Banner */}
          {product.bulk_discount_rules && product.bulk_discount_rules.length > 0 && (
            <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200/60 rounded-xl">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1.5">🎁 Bulk Discount Offers</span>
              <div className="space-y-1">
                {product.bulk_discount_rules.map((rule: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                    <span>Buy <strong className="text-amber-800">{rule.min_qty} or more</strong>:</span>
                    <span className="font-semibold text-green-600">Save ৳{formatAmount(rule.discount_amount)} per item</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 border-t border-b border-gray-100 py-3 space-y-3">
            <div
              className={`text-gray-600 text-xs md:text-sm leading-relaxed ${!product.short_description ? "hidden" : ""}
                [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-4 [&_strong]:font-bold [&_b]:font-bold [&_a]:text-blue-600`}
              dangerouslySetInnerHTML={{ __html: formatProductDescriptionUniversal(product.short_description || "") }}
            />

            <div className="flex flex-col gap-3 mt-1">
              {/* Color Selector — Only Keep Image */}
              {colorData.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800 text-xs md:text-sm block mb-1.5">
                    Color: <span className="font-bold text-gray-900">{selectedColor?.name}</span>
                    {cartSizesForSelectedColor && (
                      <span className="text-blue-600 font-bold ml-1.5">
                        + {cartSizesForSelectedColor}
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colorData.map((c: any, idx: number) => {
                      const cartCountForColor = cart.filter(item => item.id === product.id && item.variant?.color === c.name).reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c);
                            setQuantity(1);
                            if (c.img) {
                              setMainImageOverride(c.img);
                            }
                          }}
                          title={c.name}
                          className={clsx(
                            "relative p-0.5 rounded-lg border-2 transition overflow-visible cursor-pointer hover:scale-105 shrink-0",
                            selectedColor?.id === c.id
                              ? "border-blue-600 ring-2 ring-blue-200 shadow-sm"
                              : cartCountForColor > 0
                                ? "border-blue-500 ring-1 ring-blue-100"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                          )}
                        >
                          {cartCountForColor > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full shadow-sm z-10 px-0.5 ${selectedColor?.id === c.id ? 'bg-blue-600 text-white ring-1 ring-white' : 'bg-blue-600 text-white'}`}>
                              {cartCountForColor}
                            </span>
                          )}
                          <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-md overflow-hidden bg-gray-50 shrink-0">
                            {c.img ? (
                              <Image
                                src={c.img}
                                alt={c.name || "Color"}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-100 font-bold uppercase">
                                {c.name?.substring(0, 2) || "CL"}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizeData.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800 text-xs md:text-sm block mb-1.5">
                    Size: <span className="font-bold text-gray-900">{selectedSize}</span>
                    {cartColorsForSelectedSize && (
                      <span className="text-blue-600 font-bold ml-1.5">
                        + {cartColorsForSelectedSize}
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizeData.map((s: any, idx: number) => {
                      const cartCountForSize = cart.filter(item => item.id === product.id && item.variant?.size === s).reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSelectedSize(s); setQuantity(1); }}
                          className={clsx(
                            "relative px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border transition",
                            selectedSize === s
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : cartCountForSize > 0
                                ? "border-blue-600 text-blue-600 bg-white ring-1 ring-blue-200"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {cartCountForSize > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full shadow-sm z-10 px-0.5 ${selectedSize === s ? 'bg-blue-600 text-white ring-1 ring-white' : 'bg-blue-600 text-white'}`}>
                              {cartCountForSize}
                            </span>
                          )}
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Weight Selector */}
              {weightData.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800 text-xs md:text-sm block mb-1.5">
                    Weight: <span className="font-bold text-gray-900">{typeof selectedWeight === "string" ? selectedWeight : selectedWeight?.name || ""}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {weightData.map((w: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setSelectedWeight(w); setQuantity(1); }}
                        className={clsx(
                          "px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg border transition",
                          (selectedWeight?.id === w.id || selectedWeight === w)
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {w.name || w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <span className="font-semibold text-gray-800 text-xs md:text-sm block mb-1.5">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-600 hover:text-blue-600 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800 text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons — Frozen/Sticky at bottom ONLY on mobile, standard static in right column on desktop */}
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.12)] flex gap-3 md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none md:z-auto md:mt-4 md:mb-2 md:relative">
            {/* Modern Cart Motion Animation Toast */}
            {showCartAnimation && <AddtocartToster />}

            <button
              type="button"
              onClick={(e) => handleAddToCart(false, e.currentTarget)}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base shadow-sm"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              type="button"
              onClick={() => {
                handleAddToCart(true);
              }}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-600/30 cursor-pointer text-sm md:text-base"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 bg-white mt-4 rounded-lg border border-gray-100">
        {(() => {
          // Resolve specs content: handle HTML string, legacy array, or JSON array
          let specsHtml = "";
          if (typeof product.specifications === "string" && product.specifications.trim()) {
            // Check if it's a JSON array (legacy)
            if (product.specifications.trim().startsWith("[")) {
              try {
                const arr = JSON.parse(product.specifications);
                if (Array.isArray(arr) && arr.length > 0) {
                  specsHtml = "<ul>" + arr.map((s: any) => `<li>${String(s)}</li>`).join("") + "</ul>";
                }
              } catch {
                specsHtml = product.specifications;
              }
            } else {
              specsHtml = product.specifications;
            }
          } else if (Array.isArray(product.specifications) && product.specifications.length > 0) {
            const first = String(product.specifications[0] || "");
            if (first.includes("<") && (first.includes(">") || first.includes("</"))) {
              specsHtml = product.specifications.join("");
            } else {
              specsHtml = "<ul>" + product.specifications.map((s: any) => `<li>${String(s)}</li>`).join("") + "</ul>";
            }
          }

          if (!specsHtml) return null;

          return (
            <div className="mb-4">
              <h2 className="text-xl font-medium mb-2">Specification</h2>
              <div
                className="rich-content-lg"
                dangerouslySetInnerHTML={{ __html: specsHtml }}
              />
            </div>
          );
        })()}
        <div>
          <h1 className="text-2xl font-medium">Product Details</h1>
          <div>
            <div
              className={`text-gray-600 leading-relaxed transition-all duration-300 text-sm md:text-base 
                [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-800
                [&_strong]:font-bold [&_strong]:text-gray-900 [&_b]:font-bold [&_b]:text-gray-900 
                [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700
                [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:shadow-md [&_img]:mx-auto
                [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:shadow-sm
                [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
                [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 [&_td]:text-gray-600
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg
                ${expanded ? "" : "line-clamp-5 overflow-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-24 after:bg-gradient-to-t after:from-white/0 after:to-white pointer-events-auto"}`}
              dangerouslySetInnerHTML={{ __html: formatProductDescriptionUniversal(product.description || "") }}
            />

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              {expanded ? "See less" : "See all"}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Spacer for sticky bottom action bar */}
      <div className="h-28 md:hidden" />
    </div>
  );
};

export default ProductDetails;
