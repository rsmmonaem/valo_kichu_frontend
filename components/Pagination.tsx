"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

const Pagination: React.FC<PaginationProps> = ({ meta }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { current_page, last_page } = meta;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > last_page) return;
        router.push(createPageURL(page));
    };

    if (last_page <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (last_page <= maxVisible) {
            for (let i = 1; i <= last_page; i++) pages.push(i);
        } else {
            // Always show first, last, current, and neighbors
            if (current_page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(last_page);
            } else if (current_page >= last_page - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = last_page - 3; i <= last_page; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(current_page - 1);
                pages.push(current_page);
                pages.push(current_page + 1);
                pages.push('...');
                pages.push(last_page);
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{meta.from}</span> to <span className="font-medium">{meta.to}</span> of <span className="font-medium">{meta.total}</span> results
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => handlePageChange(page)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${current_page === page
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 border border-transparent hover:border-gray-200'
                                    }`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="w-9 h-9 flex items-center justify-center text-gray-400">
                                ...
                            </span>
                        )}
                    </React.Fragment>
                ))}

                <button
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                    aria-label="Next Page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
