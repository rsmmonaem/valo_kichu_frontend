"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { Banner } from '@/lib/api';
import { trackViewPromotion, trackSelectPromotion } from '@/lib/gtm';

interface HeroSliderProps {
    banners: Banner[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // GA4: Track view_promotion when banners are available
    useEffect(() => {
        if (banners && banners.length > 0) {
            const promotions = banners.map((b, idx) => ({
                promotion_id: String(b.id || `banner_${idx + 1}`),
                promotion_name: b.title || `Promotion Banner ${idx + 1}`,
                creative_name: b.image || b.image_url || 'Hero Banner Image',
                creative_slot: `hero_slide_${idx + 1}`
            }));
            trackViewPromotion(promotions);
        }
    }, [banners]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleBannerClick = (banner: Banner, index: number) => {
        trackSelectPromotion({
            promotion_id: String(banner.id || `banner_${index + 1}`),
            promotion_name: banner.title || `Promotion Banner ${index + 1}`,
            creative_name: banner.image || banner.image_url || 'Hero Banner Image',
            creative_slot: `hero_slide_${index + 1}`
        });
    };

    if (banners.length === 0) {
        return (
            <div className="relative h-[250px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden bg-gray-900 group">
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                    <p className="text-lg opacity-50">No Banners Available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[250px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden bg-gray-100 group">
            {banners.map((banner, index) => (
                <div
                    key={banner.id || index}
                    className={clsx(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    {banner.link ? (
                        <Link
                            href={banner.link}
                            onClick={() => handleBannerClick(banner, index)}
                            className="absolute inset-0 z-0"
                            prefetch={false}
                        >
                            <Image
                                src={banner.image_url || ((banner.image && banner.image.startsWith('http')) ? banner.image : `${process.env.NEXT_PUBLIC_API_URL}/storage/${banner.image}`)}
                                alt={banner.title || 'Banner'}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                                className="object-cover"
                                priority={index === 0}
                            />
                        </Link>
                    ) : (
                        <Image
                            src={banner.image_url || ((banner.image && banner.image.startsWith('http')) ? banner.image : `${process.env.NEXT_PUBLIC_API_URL}/storage/${banner.image}`)}
                            alt={banner.title || 'Banner'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                            className="object-cover"
                            priority={index === 0}
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-6 md:px-16 text-white text-left">
                        {banner.title && (
                            <h2 className="text-2xl md:text-5xl font-extrabold max-w-lg leading-tight uppercase drop-shadow-md">
                                {banner.title}
                            </h2>
                        )}
                        {banner.link && (
                            <Link
                                href={banner.link}
                                onClick={() => handleBannerClick(banner, index)}
                                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm w-fit hover:bg-blue-600/90 transition shadow-lg"
                                prefetch={false}
                            >
                                Shop Now
                            </Link>
                        )}
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={clsx(
                                "w-2 h-2 rounded-full transition-all",
                                index === currentIndex ? "bg-blue-600 w-6" : "bg-white/50"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroSlider;
