import { getProducts, getSettings, getCategory, getCategoryList } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductSort from '@/components/ProductSort';
import ProductCatalog from '@/components/ProductCatalog';
import { Metadata } from 'next';
import { Filter } from 'lucide-react';
import ClientSidebarWrapper from '@/components/ClientSidebarWrapper';
import ClientFilterButton from '@/components/ClientFilterButton';

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
        <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar (Desktop) & Mobile Drawer Control */}
                <div className="flex-shrink-0">
                    <ClientSidebarWrapper categories={categories} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Row 1 (mobile): Category Title | Filter Button */}
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{pageTitle}</h1>
                        {/* Mobile-only filter trigger — rendered here so it sits beside the title */}
                        <div className="lg:hidden">
                            <ClientFilterButton categories={categories} />
                        </div>
                    </div>

                    {/* Row 2: Sort Dropdown */}
                    <div className="mb-5">
                        <ProductSort />
                    </div>

                    {/* Products Grid with Infinite Scroll */}
                    <ProductCatalog initialProducts={products} initialMeta={meta} />
                </div>
            </div>
        </div>
    );
}
