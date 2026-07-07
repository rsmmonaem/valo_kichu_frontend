"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product } from '@/lib/api';
import ProductModal from './ProductModal'; // Make sure this path is correct
import { formatAmount } from '@/lib/utils/formatAmount';
import { getDefaultColor } from '@/lib/utils/getDefaultColorImage';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // if (!product.image) {
    //     console.log('No image found for product:', product.name);
    // }
    // else {
    //     console.log('Image found for product:', product.name, product.image);
    // }
    // Image handling logic ported from React app
    let displayImage: string | null = null;

    if (typeof product.image === 'string') {
        displayImage = product.image;
    } else if (typeof product.thumbnail === 'string') {
        displayImage = product.thumbnail;
    }
    if (!displayImage && Array.isArray(product.images) && product.images.length > 0) {
        const firstImg = product.images[0];
        if (typeof firstImg === 'string') {
            displayImage = firstImg;
        } else if (typeof firstImg === 'object' && firstImg?.image) {
            displayImage = firstImg.image;
        }
    }

    // Fallback for gallery_images parsing if needed, but simplistic for now

    // Standardize the API base URL to remove /api for storage links
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

    const resolveImageUrl = (url: string) => {
        if (!url) return null;
        let cleanUrl = url;

        if (url.startsWith('http')) {
            // Strip any embedded /api/ segment that Laravel may add when APP_URL includes /api
            cleanUrl = url.replace(/(\api)(\/storage\/)/, '$2');
        } else {
            // Relative path — always lives under /storage/products/
            const filename = url
                .replace(/^\/?storage\/products\//, '')
                .replace(/^\/?products\//, '')
                .replace(/^\/?storage\//, '');
            cleanUrl = `${baseUrl}/storage/products/${filename}`;
        }

        // If still pointing at localhost with an ss-prefixed filename → fall back to production
        if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1')) {
            const filename = cleanUrl.split('/').pop() || '';
            if (filename.startsWith('ss')) {
                return cleanUrl.replace(/^https?:\/\/[^/]+/, 'https://backend.valokichu.com');
            }
        }
        return cleanUrl;
    };

    // --- Priority color image logic ---
    // Parse colors from product
    let parsedColors: any[] = [];
    if (product.colors) {
        if (typeof product.colors === 'string') {
            try { parsedColors = JSON.parse(product.colors); } catch { parsedColors = []; }
        } else if (Array.isArray(product.colors)) {
            parsedColors = product.colors;
        }
    }
    const defaultColor = getDefaultColor(parsedColors);
    const priorityColorImage = defaultColor
        ? resolveImageUrl(defaultColor.image || defaultColor.color_image || '')
        : null;

    const rawImage = priorityColorImage || product.image_url || displayImage;
    const finalImage = rawImage
        ? (resolveImageUrl(rawImage) || 'https://placehold.co/400x400?text=No+Image')
        : 'https://placehold.co/400x400?text=No+Image';

    const basePrice = parseFloat(product.base_price || product.price || '0');
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
    const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;

    const handleEyeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // console.log('Eye icon clicked for:', product.name);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="group bg-white rounded-xl border border-gray-100 hover:border-blue-600/30 hover:shadow-lg transition duration-300 overflow-hidden flex flex-col h-full relative cursor-pointer block">
                {/* Overlay Link for full-card clickability */}
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} prefetch={false} />

                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <div className="relative overflow-hidden group w-full h-full" onClick={handleEyeClick}>
                        <Image
                            src={finalImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover group-hover:scale-110 transition duration-500"
                            loading="lazy"
                        />
                    </div>

                    {/* Quick View Button - Z-index higher than overlay link */}
                    {/* <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 flex items-center justify-center cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                        onClick={handleEyeClick}
                        type="button"
                        aria-label={`Quick view ${product.name}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    </button> */}

                    {hasDiscount && salePrice && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none z-10">
                            -{Math.round(((basePrice - salePrice) / basePrice) * 100)}%
                        </div>
                    )}
                </div>

                <div className="p-3 flex flex-col flex-grow relative z-0 pointer-events-none">
                    {/* pointer-events-none on content container lets clicks pass through to the absolute link, 
                        BUT unexpected if text selection is needed. 
                        Actually, since the Link is absolute inset-0 z-0, it covers everything. 
                        If we want text to be selectable, we might need z-1 on content. 
                        But for a simple product card, fully clickable is usually preferred. */}
                    <div>
                        <h4 className="text-sm text-gray-700 font-medium mb-1 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition" title={product.name}>
                            {product.name}
                        </h4>
                        <div className="mt-auto pt-2">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-lg font-bold text-blue-600">৳{formatAmount(hasDiscount ? salePrice : basePrice)}</span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">৳{formatAmount(basePrice)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your Product Modal */}
            {isModalOpen && (
                <ProductModal
                    product={product}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

export default ProductCard;