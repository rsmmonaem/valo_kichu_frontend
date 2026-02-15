import { getProducts, getSettings, getCategory, getCategoryList } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductSort from '@/components/ProductSort';
import Pagination from '@/components/Pagination';
import { Metadata } from 'next';
import { Filter } from 'lucide-react';
import ClientSidebarWrapper from '@/components/ClientSidebarWrapper';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const categorySlug = params.category as string;
    const settings = await getSettings();

    if (categorySlug) {
        const { data: category } = await getCategory(categorySlug);
        if (category && category.id) {
            return {
                title: category.meta_title || category.name + ' | ValoKichu',
                description: category.meta_description || `Browse ${category.name} products.`,
                keywords: category.meta_keywords || ''
            };
        }
    }

    return {
        title: settings.products_page_title || 'Products | ValoKichu',
        description: settings.products_page_description || 'Browse our collection of high-quality products.',
    };
}

export default async function ProductsPage({ searchParams }: Props) {
    const params = await searchParams;

    // Parse query parameters
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
    const search = typeof params.search === 'string' ? params.search : undefined;
    const categorySlug = typeof params.category === 'string' ? params.category : undefined;
    const minPrice = typeof params.min_price === 'string' ? parseInt(params.min_price) : undefined;
    const maxPrice = typeof params.max_price === 'string' ? parseInt(params.max_price) : undefined;
    const sort = typeof params.sort === 'string' ? params.sort : undefined;

    // Parallel Data Fetching
    const [productsRes, categoriesRes] = await Promise.all([
        getProducts(page, categorySlug, search, minPrice, maxPrice, sort),
        getCategoryList()
    ]);

    const products = productsRes.data?.data || [];
    const meta = productsRes.data ? {
        current_page: productsRes.data.current_page,
        last_page: productsRes.data.last_page,
        from: productsRes.data.from,
        to: productsRes.data.to,
        total: productsRes.data.total
    } : null;

    const categories = categoriesRes.data || [];

    // Title Logic
    let pageTitle = "All Products";
    if (search) pageTitle = `Search Results for "${search}"`;
    else if (categorySlug) {
        // Find category name if possible
        const activeCat = categories.find(c => c.slug === categorySlug || c.id.toString() === categorySlug);
        pageTitle = activeCat ? activeCat.name : "Category Products";
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar (Desktop) & Mobile Drawer Control */}
                <div className="flex-shrink-0">
                    <ClientSidebarWrapper categories={categories} />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">{pageTitle} <span className="text-sm font-normal text-gray-500 ml-2">({meta?.total || 0} items)</span></h1>
                        <ProductSort />
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div className="text-gray-400 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    We couldn't find any products matching your filters. Try clearing them or using different keywords.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <Pagination meta={meta} />
                    )}
                </div>
            </div>
        </div>
    );
}
