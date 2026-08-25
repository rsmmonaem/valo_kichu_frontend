"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingCart, Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
// import points from "@/public/coin.png";
import { parseGalleryImages } from "@/lib/utils/parseGalleryImages";
import { parseAttributes } from "@/lib/utils/parseAttributes";
import { Product, getProduct } from "@/lib/api"; // Import the same Product type
import AddtocartToster from "./AddtocartToster";
import DOMPurify from "dompurify";
import { formatProductDescriptionUniversal } from "@/lib/utils/formatProductDescription";
import { formatAmount } from "@/lib/utils/formatAmount";
import * as fpixel from "@/lib/fpixel";
import { getDefaultColor } from '@/lib/utils/getDefaultColorImage';
import { getImageUrl } from '@/lib/utils';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onNextProduct?: () => void;
  onPrevProduct?: () => void;
}

export default function ProductModal({
  product: initialProduct,
  onClose,
  onNextProduct,
  onPrevProduct,
}: ProductModalProps) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);

  // Update product state and fetch fresh data when initialProduct prop changes
  useEffect(() => {
    setProduct(initialProduct);
    if (initialProduct?.slug) {
      getProduct(initialProduct.slug).then(res => {
        if (res.status && res.data) {
          setProduct(res.data);
        }
      }).catch(console.error);
    }
  }, [initialProduct]);
  const [quantity, setQuantity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [galleryId, setGalleryId] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showCartAnimation, setShowCartAnimation] = useState(false); // ADDED: Animation state

  // Use Cart Context
  const { cart = [], addToCart } = useCart?.() || { cart: [], addToCart: () => { } };
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Safe parsing of product.variations and product.colors (handling potential JSON string or array or object)
  const parsedVariations = useMemo(() => {
    if (!product?.variations) return [];
    if (typeof product.variations === 'string') {
      try {
        const parsed = JSON.parse(product.variations);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
  }, [product?.variations]);

  const parsedColors = useMemo(() => {
    if (!product?.colors) return [];
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.colors) ? product.colors : Object.values(product.colors);
  }, [product?.colors]);

  // ---------------- PARSE DATA ----------------
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
    let cleanUrl = url;
    if (!url.startsWith('http')) {
      cleanUrl = `${baseUrl}/storage/products/${url.replace(/^\/?(storage\/products|products)\/?/, "")}`;
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

  const galleryArray = product
    ? parseGalleryImages(product.gallery_images) || []
    : [];
  const productAttributes = product
    ? parseAttributes(product.attributes) || []
    : [];

  // Extract size and color from attributes + product data
  // For colors: prefer product.colors field, then fall back to attributes
  const colorData = (() => {
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
  })();

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

  // Gallery images for thumbnails
  const galleryImages = (product?.gallery_image_urls && product.gallery_image_urls.length > 0)
    ? product.gallery_image_urls.map((img: string, index: number) => ({ id: index + 1, img: resolveImageUrl(img) }))
    : galleryArray.map((image: string, index: number) => {
      return {
        id: index + 1,
        img: resolveImageUrl(image),
      };
    }) || [];

  // Initialize states
  const [size, setSize] = useState(sizeData[0] || "");
  // Use priority-1 color as default
  const defaultColorForInit = getDefaultColor(parsedColors);
  const [color, setColor] = useState(
    defaultColorForInit
      ? {
        id: defaultColorForInit.id || 1,
        name: typeof defaultColorForInit === 'string' ? defaultColorForInit : defaultColorForInit.name || '',
        img: resolveImageUrl(defaultColorForInit?.image || defaultColorForInit?.color_image || ''),
        priority: defaultColorForInit.priority ?? null,
      }
      : colorData[0] || {}
  );
  const [weight, setWeight] = useState(weightData[0]);


  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (!product) return;

    // Reset states for the new product
    const parsedAttrs = parseAttributes(product.attributes) || [];
    const parsedColorsLocal = (() => {
      if (!product.colors) return [];
      if (typeof product.colors === 'string') {
        try {
          const parsed = JSON.parse(product.colors);
          return Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch { return []; }
      }
      return Array.isArray(product.colors) ? product.colors : Object.values(product.colors);
    })();
    const parsedVariationsLocal = (() => {
      if (!product.variations) return [];
      if (typeof product.variations === 'string') {
        try {
          const parsed = JSON.parse(product.variations);
          return Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch { return []; }
      }
      return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
    })();

    const colorDataLocal = (() => {
      let colors = [];
      if (parsedColorsLocal.length > 0) {
        colors = parsedColorsLocal.map((c: any, idx: number) => ({
          id: c.id || idx + 1,
          name: typeof c === "string" ? c : c.name || "",
          img: resolveImageUrl(c?.image || c?.color_image || ""),
          priority: c.priority ?? null,
        }));
      } else {
        colors = parsedAttrs
          .find((a) => a.name?.toLowerCase() === "color")
          ?.values.map((c: any, idx: number) => ({
            id: idx + 1,
            name: typeof c === "string" ? c : c.name || "",
            img: resolveImageUrl(c?.image || ""),
            priority: null,
          })) || [];
      }
      return [...colors].sort((a, b) => {
        const aPriority = a.priority !== null && a.priority !== undefined && !isNaN(Number(a.priority)) ? Number(a.priority) : Infinity;
        const bPriority = b.priority !== null && b.priority !== undefined && !isNaN(Number(b.priority)) ? Number(b.priority) : Infinity;
        if (aPriority === bPriority) return 0;
        return aPriority - bPriority;
      });
    })();

    const attrSizesLocal = parsedAttrs.find((a) => a.name?.toLowerCase() === "size")?.values || [];
    const variationSizesLocal = parsedVariationsLocal.length > 0
      ? [...new Set(parsedVariationsLocal.map((v: any) => v.size || getVariationAttr(v, 'size')).filter(Boolean))]
      : [];
    const sizeDataLocal = attrSizesLocal.length > 0
      ? [...new Set([...attrSizesLocal, ...variationSizesLocal])]
      : variationSizesLocal;

    const attrWeightsLocal = parsedAttrs
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || ""),
      })) || [];
    const variationWeightNamesLocal = parsedVariationsLocal.length > 0
      ? [...new Set(parsedVariationsLocal.map((v: any) => v.weight || getVariationAttr(v, 'weight')).filter(Boolean))]
      : [];
    const weightDataLocal = attrWeightsLocal.length > 0
      ? attrWeightsLocal
      : variationWeightNamesLocal.map((w: any, idx: number) => ({ id: idx + 1, name: w, img: "" }));

    setSize(sizeDataLocal[0] || "");
    setWeight(weightDataLocal[0]);
    // Use priority-1 color as default
    const defaultColorLocal = getDefaultColor(parsedColorsLocal);
    if (defaultColorLocal) {
      const defaultColorObj = {
        id: defaultColorLocal.id || 1,
        name: typeof defaultColorLocal === 'string' ? defaultColorLocal : defaultColorLocal.name || '',
        img: resolveImageUrl(defaultColorLocal?.image || defaultColorLocal?.color_image || ''),
        priority: defaultColorLocal.priority ?? null,
      };
      setColor(defaultColorObj);
      // Set preview to priority-1 color image if it exists
      if (defaultColorObj.img) {
        setPreview(defaultColorObj.img);
        setHasImageError(false);
        return; // Skip default preview logic below
      }
    } else {
      setColor(colorDataLocal[0] || {});
    }

    const mainImage = product.image_url || ((typeof product.images === 'string') ? product.images : '') || product.image || product.thumbnail || "";

    const galleryImagesLocal = (product.gallery_image_urls && product.gallery_image_urls.length > 0)
      ? product.gallery_image_urls.map((img: string, index: number) => ({ id: index + 1, img: resolveImageUrl(img) }))
      : (parseGalleryImages(product.gallery_images) || []).map((image: string, index: number) => {
        return {
          id: index + 1,
          img: resolveImageUrl(image),
        };
      });

    const initialPreview = galleryImagesLocal[0]?.img || resolveImageUrl(mainImage);

    setPreview(initialPreview || "https://placehold.co/600x600?text=No+Image");
    setHasImageError(false);
  }, [product]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrevProduct) onPrevProduct();
      if (e.key === "ArrowRight" && onNextProduct) onNextProduct();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, onNextProduct, onPrevProduct]);

  // Touch Swipe gestures for Gallery-like product switching
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onNextProduct) {
      onNextProduct();
    }
    if (isRightSwipe && onPrevProduct) {
      onPrevProduct();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // ---------------- HANDLERS ----------------
  const handleAddToCart = () => {
    if (!product) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
    const rawImage = product.image || product.thumbnail || "";
    const resolvedImage = product.image_url
      ? product.image_url
      : (rawImage.startsWith('http')
        ? rawImage
        : rawImage ? `${baseUrl}/storage/products/${rawImage.replace(/^\/?storage\/products\/?/, '')}` : '');

    const matchedVariation = parsedVariations.find((v: any) => {
      const variationColorName = (v.color || '').toLowerCase();
      const colorMatch = !variationColorName || variationColorName === (typeof color === 'string' ? color : color?.name || '').toLowerCase();
      const variationSize = (v.size || '').toLowerCase();
      const sizeMatch = !variationSize || variationSize === (size || '').toLowerCase();
      const variationWeight = (v.weight || '').toLowerCase();
      const weightMatch = !variationWeight || variationWeight === (typeof weight === 'string' ? weight : weight?.name || '').toLowerCase();
      return colorMatch && sizeMatch && weightMatch;
    });

    const variantId = matchedVariation?.id || [
      typeof color === 'string' ? color : color?.name || '',
      size || '',
      typeof weight === 'string' ? weight : weight?.name || ''
    ].filter(Boolean).join('-');

    const cartItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: color?.img || resolvedImage,
      quantity: quantity,
      variant: {
        id: variantId,
        size: typeof size === "string" ? size : "",
        color: typeof color === 'string' ? color : color?.name,
        weight: typeof weight === "string" ? weight : weight?.name,
        image: color?.img || undefined,
      },
      bulk_discount_rules: product.bulk_discount_rules,
    };
    // @ts-ignore
    addToCart(cartItem);

    // ADDED: Show animation
    setShowCartAnimation(true);

    // ADDED: Hide animation after 2 seconds
    setTimeout(() => {
      setShowCartAnimation(false);
    }, 2000);

    // Don't close modal immediately
    // onClose(); // Commented out to keep modal open with animation
  };

  const handleBuyNow = () => {
    if (!product) return;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
    const rawImage = product.image || product.thumbnail || "";
    const resolvedImage = product.image_url
      ? product.image_url
      : (rawImage.startsWith('http')
        ? rawImage
        : rawImage ? `${baseUrl}/storage/products/${rawImage.replace(/^\/?storage\/products\/?/, '')}` : '');

    const matchedVariation = parsedVariations.find((v: any) => {
      const variationColorName = (v.color || '').toLowerCase();
      const colorMatch = !variationColorName || variationColorName === (typeof color === 'string' ? color : color?.name || '').toLowerCase();
      const variationSize = (v.size || '').toLowerCase();
      const sizeMatch = !variationSize || variationSize === (size || '').toLowerCase();
      const variationWeight = (v.weight || '').toLowerCase();
      const weightMatch = !variationWeight || variationWeight === (typeof weight === 'string' ? weight : weight?.name || '').toLowerCase();
      return colorMatch && sizeMatch && weightMatch;
    });

    const variantId = matchedVariation?.id || [
      typeof color === 'string' ? color : color?.name || '',
      size || '',
      typeof weight === 'string' ? weight : weight?.name || ''
    ].filter(Boolean).join('-');

    const cartItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: color?.img || resolvedImage,
      quantity: quantity,
      variant: {
        id: variantId,
        size: typeof size === "string" ? size : "",
        color: typeof color === 'string' ? color : color?.name,
        weight: typeof weight === "string" ? weight : weight?.name,
        image: color?.img || undefined,
      },
      bulk_discount_rules: product.bulk_discount_rules,
    };
    // @ts-ignore
    addToCart(cartItem);

    // ADDED: Show animation
    // setShowCartAnimation(true);

    // ADDED: Navigate after animation
    // setTimeout(() => {
    //   setShowCartAnimation(false);
    //   router.push("/checkout");
    //   onClose();
    // }, 2000);
    router.push("/checkout");
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("BDT", "৳");
  };

  // Video URL conversion for iframe
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com")) {
      return url
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // const formatDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   // Check if already valid HTML
  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   // Auto-format plain messy text
  //   const formatted = text
  //     // Fix joined words (Colorfabric → Color fabric)
  //     .replace(/([a-z])([A-Z])/g, "$1 $2")

  //     // Add spacing after commas
  //     .replace(/,/g, ", ")

  //     // Add line break before common sections
  //     .replace(
  //       /(Size:|Fabric:|Material:|Color:|Features?:|Specification:)/gi,
  //       "<br/><br/><strong>$1</strong>"
  //     )

  //     // Add line break before size patterns
  //     .replace(/(XS=|S=|M=|L=|XL=|XXL=|XXXL=)/g, "<br/>• <strong>$1</strong>")

  //     // Replace dash formatting
  //     .replace(/-/g, ": ")

  //     .trim();

  //   return `<p>${formatted}</p>`;
  // };

  // Calculate price from your ProductCard logic
  // const formatDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   // Detect real HTML
  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   let formatted = text;

  //   formatted = formatted
  //     // Fix missing space after colon
  //     .replace(/:/g, ": ")

  //     // Fix joined words like Type:polo
  //     .replace(/([a-z])([A-Z])/g, "$1 $2")

  //     // Ensure bullet starts new line
  //     .replace(/•/g, "<br/>• ")

  //     // Fix double spaces
  //     .replace(/\s+/g, " ")

  //     // Add spacing before Size section
  //     .replace(/Size:/gi, "<br/><br/><strong>Size:</strong> ")

  //     // Make main title bold
  //     .replace(
  //       /^([^•]+)/,
  //       "<strong>$1</strong><br/><br/>"
  //     )

  //     .trim();

  //   return `<div class="space-y-1">${formatted}</div>`;
  // };
  // export const formatProductDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   let clean = text
  //     .replace(/::/g, ":")
  //     .replace(/:\s*/g, ": ")
  //     .replace(/\s+/g, " ")
  //     .trim();

  //   const sections: string[] = [];

  //   // Split by Bangla headings
  //   const headingPattern =
  //     /(মূল বৈশিষ্ট্যসমূহ|এটা কেন কিনবেন|প্যাকেজে যা যা থাকছে|পণ্যের ধরন|লাভ|ফিনিশ|বিশেষত্ব|কভারেজ)/g;

  //   const parts = clean.split(headingPattern);

  //   for (let i = 0; i < parts.length; i++) {
  //     const part = parts[i];

  //     if (headingPattern.test(part)) {
  //       sections.push(`<h4 class="font-semibold mt-4 mb-2">${part}</h4>`);
  //     } else {
  //       // Detect numbered items like ১ টি
  //       if (/\d+\s?টি/.test(part)) {
  //         const items = part.match(/\d+\s?টি[^০-৯]+/g);
  //         if (items) {
  //           sections.push(
  //             `<ul class="list-disc pl-5">${items
  //               .map((item) => `<li>${item.trim()}</li>`)
  //               .join("")}</ul>`
  //           );
  //           continue;
  //         }
  //       }

  //       // Split Bangla sentences
  //       const sentences = part.split("।").filter(Boolean);

  //       sections.push(
  //         sentences
  //           .map((s) => `<p class="mb-2">${s.trim()}।</p>`)
  //           .join("")
  //       );
  //     }
  //   }

  //   return sections.join("");
  // };
  const formatted = formatProductDescriptionUniversal(product?.description || "");
  const basePrice = product
    ? parseFloat(product.base_price || product.price || "0")
    : 0;
  const salePrice =
    product && product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;

  // --- Variation-wise price logic ---
  const getVariationPrice = (): number | null => {
    if (parsedVariations.length === 0) return null;
    const selectedColorName = (typeof color === 'string' ? color : color?.name || '').toLowerCase();
    const selectedSizeName = (typeof size === 'string' ? size : (size as any)?.name || '').toLowerCase();
    const selectedWeightName = (typeof weight === 'string' ? weight : (weight as any)?.name || '').toLowerCase();

    const matchedVariation = parsedVariations.find((v: any) => {
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

    if (matchedVariation) {
      const finalPrice = matchedVariation.price !== undefined ? parseFloat(matchedVariation.price) : null;
      if (finalPrice !== null && finalPrice > 0) {
        return finalPrice;
      }
    }
    return null;
  };

  const variationPrice = getVariationPrice();
  const displayPrice = variationPrice !== null ? variationPrice : (hasDiscount && salePrice ? salePrice : basePrice);

  // Meta Pixel: Track ViewContent for Quick View
  useEffect(() => {
    if (product && product.id) {
      fpixel.event('ViewContent', {
        content_ids: [product.id.toString()],
        content_name: product.name,
        content_category: product.category?.name || 'Store Item',
        content_type: 'product',
        value: Number(displayPrice || 0),
        currency: 'BDT'
      });
    }
  }, [product?.id, product?.name, product?.category?.name, displayPrice]);

  // Calculate dynamic bulk discount preview for quantity selector in modal
  let activeBulkDiscountPerItem = 0;
  if (product?.bulk_discount_rules && Array.isArray(product.bulk_discount_rules)) {
    for (const rule of product.bulk_discount_rules) {
      const minQty = Number(rule.min_qty) || 0;
      const discAmt = Number(rule.discount_amount) || 0;
      if (minQty > 0 && quantity >= minQty) {
        activeBulkDiscountPerItem = Math.max(activeBulkDiscountPerItem, discAmt);
      }
    }
  }
  const productCartItems = cart.filter((item) => item.id === product?.id);
  const totalCartQuantity = productCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Total Price = (total variant count in cart * product price), or (quantity * product price) if cart is empty
  const previewTotalPrice = totalCartQuantity > 0
    ? totalCartQuantity * previewUnitPrice
    : previewUnitPrice * quantity;

  if (!product) return null;

  return (
    <>
      <div
        className="jsx-15846967f5c40aee fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-300 "
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
        <div
          ref={modalRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-6xl max-h-[75vh] md:max-h-[92vh] bg-white border border-yellow-600 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-800" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 md:gap-10">
              {/* LEFT COLUMN - Images & Gallery */}
              <div>
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 group/gallery border border-gray-100">
                  {product && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-4 right-4 p-3 bg-white/95 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md z-20 transition duration-300 backdrop-blur-sm cursor-pointer hover:scale-105"
                      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        size={20}
                        className={`transition-all duration-300 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"}`}
                      />
                    </button>
                  )}
                  <div className="w-full aspect-square relative">
                    <Image
                      src={
                        hasImageError || !preview
                          ? "https://placehold.co/600x600?text=No+Image"
                          : preview
                      }
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
priority
                      className="object-cover transition-transform duration-500 group-hover/gallery:scale-110"
                      onLoad={(result) => {
                        if (result.naturalWidth === 0) setHasImageError(true);
                      }}
                      onError={() => setHasImageError(true)}
                    />
                  </div>

                  {/* Prev/Next Product Navigation Arrows inside Modal Image */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between px-3 z-10">
                    {onPrevProduct ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrevProduct();
                        }}
                        className="pointer-events-auto flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-white/95 hover:bg-white text-gray-800 hover:text-blue-600 rounded-full border border-gray-150 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        title="Previous Product"
                        aria-label="Previous Product"
                      >
                        <ChevronLeft size={22} className="mr-0.5" />
                      </button>
                    ) : (
                      <div />
                    )}
                    {onNextProduct ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNextProduct();
                        }}
                        className="pointer-events-auto flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-white/95 hover:bg-white text-gray-800 hover:text-blue-600 rounded-full border border-gray-150 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        title="Next Product"
                        aria-label="Next Product"
                      >
                        <ChevronRight size={22} className="ml-0.5" />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                  {/* Image Navigation - Floating inside Product Image */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currIndex = galleryImages.findIndex((g: any) => g.img === preview);
                          const prevIndex = currIndex <= 0 ? galleryImages.length - 1 : currIndex - 1;
                          setPreview(galleryImages[prevIndex]?.img);
                          setGalleryId(galleryImages[prevIndex]?.id);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/70 transition cursor-pointer"
                        aria-label="Previous Image"
                        title="Previous Image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currIndex = galleryImages.findIndex((g: any) => g.img === preview);
                          const nextIndex = currIndex >= galleryImages.length - 1 ? 0 : currIndex + 1;
                          setPreview(galleryImages[nextIndex]?.img);
                          setGalleryId(galleryImages[nextIndex]?.id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/70 transition cursor-pointer"
                        aria-label="Next Image"
                        title="Next Image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {product.tags &&
                    Array.isArray(product.tags) &&
                    product.tags.includes("best_seller") && (
                      <span className="absolute top-4 left-4 px-4 py-1 text-sm font-semibold text-white rounded-full bg-[#FFAC1C] shadow-lg">
                        Best Seller
                      </span>
                    )}
                </div>

                {/* Gallery Thumbnails — hidden on mobile (color buttons handle image switch) */}
                {galleryImages.length > 0 && (
                  <div className="hidden md:flex md:flex-wrap md:gap-5 mt-4 pb-2">
                    {galleryImages.map((g: any) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setGalleryId(g.id);
                          setPreview(g.img);
                          setHasImageError(false);
                        }}
                        className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition
                          ${g.id === galleryId
                            ? "border-[#FFAC1C] ring-2 ring-[#FFAC1C]/40"
                            : "border-gray-200 hover:border-[#FFAC1C]"
                          }`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={g.img || "https://placehold.co/60x60?text=..."}
                            alt={`Gallery ${g.id}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Mobile-only Color Selector — shown under the main image */}
                {colorData.length > 0 && (
                  <div className="block md:hidden mt-4 pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-800 text-xs block mb-2">
                      Color: {color?.name}
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {colorData.map((c: any) => {
                        const cartCountForColor = cart.filter(item => item.id === product.id && item.variant?.color === c.name).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setColor(c);
                            setQuantity(1);
                            if (c.img) {
                              setPreview(c.img);
                              setHasImageError(false);
                            }
                          }}
                          className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1.5 min-w-[72px] cursor-pointer hover:scale-105 ${color?.id === c.id ? "border-blue-600 bg-blue-600 shadow-md ring-2 ring-blue-200" : cartCountForColor > 0 ? "border-blue-600 bg-white ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                        >
                          {cartCountForColor > 0 && (
                            <span className={`absolute -top-2 -right-2 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10 ${color?.id === c.id ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                              {cartCountForColor}
                            </span>
                          )}
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {c.img ? (
                              <Image
                                src={c.img}
                                alt={c.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-gray-100 font-bold uppercase">
                                {c.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className={`text-[11px] font-semibold pr-1 text-center truncate w-full ${color?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                            {c.name}
                          </span>
                        </button>
                      )})}
                    </div>
                  </div>
                )}




                {/* Video */}
                {!isMobile && product.video_link && (
                  <div className="mt-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                      src={getEmbedVideoUrl(product.video_link)}
                      className="w-full h-full"
                      title="Product video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Product Details */}
              <div>
                {/* Product Name */}
                <h2 className="text-xl md:text-3xl font-extrabold mb-3 md:max-w-[calc(100%-3rem)] overflow-hidden">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-[#FFAC1C] fill-[#FFAC1C]"
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.rating_count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                    ৳{formatAmount(displayPrice)}
                  </span>
                  {(variationPrice !== null || hasDiscount) && displayPrice < basePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ৳{formatAmount(basePrice)}
                    </span>
                  )}
                  {hasDiscount && variationPrice === null && (
                    <span className="text-lg text-gray-400 line-through">
                      ৳{formatAmount(basePrice)}
                    </span>
                  )}
                </div>

                {/* Bulk Discount Offers Banner */}
                {product.bulk_discount_rules && product.bulk_discount_rules.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200/60 rounded-2xl">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-2">🎁 Bulk Discount Offers</span>
                    <div className="space-y-1.5">
                      {product.bulk_discount_rules.map((rule: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-gray-700">
                          <span>Buy <strong className="text-amber-800">{rule.min_qty} or more</strong>:</span>
                          <span className="font-semibold text-green-600">Save ৳{formatAmount(rule.discount_amount)} per item</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Price */}
                <div className="flex flex-col gap-1.5 mb-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Total Price:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ৳{formatAmount(previewTotalPrice)}
                    </span>
                    <span className="text-xs text-gray-400">(Tax incl.)</span>
                  </div>
                  {activeBulkDiscountPerItem > 0 && (
                    <span className="text-xs text-green-600 font-bold">
                      🎉 Bulk discount of ৳{formatAmount(activeBulkDiscountPerItem * quantity)} applied (৳{formatAmount(activeBulkDiscountPerItem)} off per item)!
                    </span>
                  )}
                </div>


                {/* Loyalty Points — single row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl w-fit mb-4">
                  <span className="text-xs text-gray-500 font-medium">Earn Loyalty Coins:</span>
                  <span className="font-bold text-yellow-600 text-xs">{product.loyalty_points || 0} Coins</span>
                </div>

                {/* Color Selection — hidden on mobile (shown under image instead) */}
                {colorData.length > 0 && (
                  <div className="hidden md:block mb-6">
                    <h3 className="font-semibold mb-3">Color: {color?.name}</h3>
                    <div className="flex flex-wrap gap-3">
                      {colorData.map((c: any) => {
                        const cartCountForColor = cart.filter(item => item.id === product.id && item.variant?.color === c.name).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setColor(c);
                            setQuantity(1);
                            if (c.img) {
                              setPreview(c.img);
                              setHasImageError(false);
                            }
                          }}
                          className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1.5 min-w-[72px] cursor-pointer hover:scale-105 ${color?.id === c.id ? "border-blue-600 bg-blue-600 shadow-md ring-2 ring-blue-200" : cartCountForColor > 0 ? "border-blue-600 bg-white ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                        >
                          {cartCountForColor > 0 && (
                            <span className={`absolute -top-2 -right-2 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10 ${color?.id === c.id ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                              {cartCountForColor}
                            </span>
                          )}
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {c.img ? (
                              <Image
                                src={c.img}
                                alt={c.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100 font-bold uppercase">
                                {c.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-1 text-center truncate w-full ${color?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                            {c.name}
                          </span>
                        </button>
                      )})}
                    </div>
                  </div>
                )}

                {/* Weight Selection */}
                {weightData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">
                      Weight: {weight?.name || weight}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {weightData.map((w: any) => (
                        <button
                          key={w.id}
                          onClick={() => { setWeight(w); setQuantity(1); }}
                          className={`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border ${w.id === weight?.id || w === weight
                            ? "border-blue-600 text-blue-600 bg-blue-50/10 ring-1 ring-blue-200"
                            : "bg-gray-100 border-transparent hover:border-gray-300"
                            }`}
                        >
                          {w.name || w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizeData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Size: {size}</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {sizeData.map((s: any) => {
                        const cartCountForSize = cart.filter(item => item.id === product.id && item.variant?.size === s).reduce((sum, item) => sum + item.quantity, 0);
                        return (
                        <button
                          key={s}
                          onClick={() => { setSize(s); setQuantity(1); }}
                          className={`relative p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border ${s === size ? "bg-blue-600 text-white border-blue-600 shadow-md" : cartCountForSize > 0 ? "border-blue-600 text-blue-600 bg-white ring-1 ring-blue-200" : "bg-gray-100 border-transparent hover:border-gray-300"}`}
                        >
                          {cartCountForSize > 0 && (
                            <span className={`absolute -top-2 -right-2 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10 ${s === size ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                              {cartCountForSize}
                            </span>
                          )}
                          {s}
                        </button>
                      )})}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-semibold text-lg">Quantity</span>
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button
                      className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                      onClick={() => handleQuantityChange("decrement")}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 font-bold min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200"
                      onClick={() => handleQuantityChange("increment")}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile Key Features */}
                {isMobile &&
                  product.key_features &&
                  Array.isArray(product.key_features) &&
                  product.key_features.length > 0 && (
                    <div className="mt-6 bg-gray-50 rounded-2xl p-6 shadow-inner">
                      <h3 className="text-lg font-bold mb-4">Key Features</h3>
                      <ul className="space-y-3">
                        {product.key_features.map((f: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-gray-700"
                          >
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#FFAC1C]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Mobile Video */}
                {isMobile && product.video_link && (
                  <div className="mt-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                      src={getEmbedVideoUrl(product.video_link)}
                      className="w-full h-full"
                      title="Product video"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Section — shown on all screens above description */}
            {(() => {
              let specsHtml = "";
              if (typeof product.specifications === "string" && product.specifications.trim()) {
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
              } else if (Array.isArray(product.specifications) && (product.specifications as any[]).length > 0) {
                const first = String(product.specifications[0] || "");
                if (first.includes("<") && (first.includes(">") || first.includes("</"))) {
                  specsHtml = (product.specifications as any[]).join("");
                } else {
                  specsHtml = "<ul>" + (product.specifications as any[]).map((s: any) => `<li>${String(s)}</li>`).join("") + "</ul>";
                }
              }
              if (!specsHtml) return null;
              return (
                <div className="px-6 md:px-8 pb-0">
                  <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                    <h3 className="text-lg font-bold mb-3">Specifications</h3>
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: specsHtml }} />
                  </div>
                </div>
              );
            })()}

            {/* Description Section */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      DOMPurify.sanitize(formatted),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sticky CTA Buttons */}

          {/* <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40">
            {showCartAnimation && (
              //             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              // <AddtocartToster />
              //             </div>
              <div className="">
                <AddtocartToster />
              </div>
            )}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition"
            >
              Buy Now
            </button>
          </div> */}
          {/* <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40 ">
            {showCartAnimation && <AddtocartToster />}

            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition"
            >
              Buy Now
            </button>
          </div> */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40">

            {/* Add to Cart Button Wrapper */}
            <div className="flex-1 relative">
              {showCartAnimation && <AddtocartToster />}

              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition cursor-pointer"
            >
              Buy Now
            </button>
          </div>

        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffac1c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e69b00;
        }
      `}</style>
    </>
  );
}
