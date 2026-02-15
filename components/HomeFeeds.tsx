"use client";

import { useEffect, useState, useRef } from "react";
import { getCategorySections, CategorySection as CategorySectionType } from "@/lib/api";
import CategorySection from "@/components/CategorySection";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Lazy Load Wrapper Component
const LazySection = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" } // Load when 200px away
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="min-h-[300px]">
            {isVisible ? children : (
                <div className="h-[300px] w-full bg-gray-50/50 animate-pulse rounded-xl mb-4 border border-dashed border-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-sm">Loading section...</span>
                </div>
            )}
        </div>
    );
};

export default function HomeFeeds() {
    const [sections, setSections] = useState<CategorySectionType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            // Don't block UI with loading state if we want instant partial renders, 
            // but here we fetch logically all sections structure first (lightweight now due to backend limit 10).
            // Ideally we would fetch list of categories first then load each section individually,
            // but current API returns all together. Since we optimized backend to limit 10 products, 
            // this payload is much smaller now so fetching all at once is acceptable.
            setLoading(true);
            try {
                const res = await getCategorySections();
                if (res && Array.isArray(res)) {
                    setSections(res);
                }
            } catch (error) {
                console.error("Failed to load home feeds", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, []);

    if (loading) {
        // Show a skeleton structure instead of a single spinner for better UX ("Frame-wise")
        return (
            <div className="flex flex-col gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[350px] w-full bg-gray-50/50 animate-pulse rounded-xl border border-gray-100" />
                ))}
            </div>
        );
    }

    if (sections.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
                <LazySection key={section.category.id || index}>
                    <CategorySection
                        title={section.category.name}
                        categorySlug={section.category.slug}
                        products={section.products}
                    />
                </LazySection>
            ))}
        </div>
    );
}
