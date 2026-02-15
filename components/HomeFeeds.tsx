"use client";

import { useEffect, useState, useRef } from "react";
import { getCategorySections } from "@/lib/api";
import CategorySection from "@/components/CategorySection";
import { Loader2 } from "lucide-react";

interface CategorySectionData {
    category: {
        id: number;
        name: string;
        slug: string;
    };
    products: any[];
}

export default function HomeFeeds() {
    const [sections, setSections] = useState<CategorySectionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const loaderRef = useRef(null);

    // Initial load or pagination logic for SECTIONS?
    // The API `getCategorySections` usually returns all sections or a fixed set.
    // If the backend doesn't support pagination for sections, we might just load them client-side to defer impact.
    // Assuming `getCategorySections` fetches ALL for now based on current API.
    // To implement true infinite scroll, backend needs to support paging categories.
    // For now, we fetch ALL but client-side render them to unblock initial paint.

    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                // TODO: Update API to support pagination if list is huge.
                // For now, fetching once is better than server-blocking.
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
        return (
            <div className="py-12 flex justify-center text-gray-400">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-8">
            {sections.map((section, index) => (
                <CategorySection
                    key={section.category.id || index}
                    title={section.category.name}
                    categorySlug={section.category.slug || section.category.id.toString()}
                    products={section.products || []}
                />
            ))}
        </div>
    );
}
