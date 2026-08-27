"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/lib/api';
import { formatAmount } from '@/lib/utils/formatAmount';
import { getDefaultColor } from '@/lib/utils/getDefaultColorImage';
import { getImageUrl } from '@/lib/utils';
import { trackSelectItem, mapProductToGAItem } from '@/lib/gtm';

interface ProductCardProps {
    product: Product;
    index?: number;
    listName?: string;
    listId?: string;
    onNextProduct?: () => void;
    onPrevProduct?: () => void;
    onOpenModal?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, listName, listId }) => {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product.id);

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

    // Standardize the API base URL to remove /api for storage links
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');

    const resolveImageUrl = (url: string) => {
        if (!url) return null;
        let cleanUrl = url;

        if (url.startsWith('http')) {
            cleanUrl = url.replace(/(\api)(\/storage\/)/, '$2');
        } else {
            const filename = url
                .replace(/^\/?storage\/products\//, '')
                .replace(/^\/?products\//, '')
                .replace(/^\/?storage\//, '');
            cleanUrl = `${baseUrl}/storage/products/${filename}`;
        }

        return getImageUrl(cleanUrl);
    };

    // --- Priority color image logic ---
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

    const handleProductClick = () => {
        const gaItem = mapProductToGAItem(product, index, 1, undefined, listName, listId);
        trackSelectItem(gaItem, listId || 'product_list', listName || 'Product List');
    };

    return (
        <Link
            href={`/products/${product.slug}`}
            onClick={handleProductClick}
            className="group bg-white rounded-xl border border-gray-100 hover:border-blue-600/30 hover:shadow-lg transition duration-300 overflow-hidden flex flex-col h-full relative cursor-pointer"
        >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <div className="relative overflow-hidden w-full h-full">
                    <Image
                        src={finalImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                    />
                </div>

                {hasDiscount && salePrice && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none z-10">
                        -{Math.round(((basePrice - salePrice) / basePrice) * 100)}%
                    </div>
                )}

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/95 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md z-20 transition duration-300 backdrop-blur-sm cursor-pointer hover:scale-105"
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        size={16}
                        className={`transition-all duration-300 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"}`}
                    />
                </button>
            </div>

            <div className="p-3 flex flex-col flex-grow">
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
        </Link>
    );
};

export default ProductCard;