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
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
            const rawImage = category.image_url || category.image;
            let imageUrl = '';
            if (rawImage) {
                if (rawImage.startsWith('http')) {
                    imageUrl = rawImage;
                } else {
                    imageUrl = `${baseUrl}/storage/${rawImage.replace(/^\/?storage\/?/, '')}`;
                }
                imageUrl = imageUrl.replace('/storage/products/', '/storage/categories/');
                if (imageUrl.includes('/storage/') && !imageUrl.includes('/storage/categories/')) {
                    imageUrl = imageUrl.replace('/storage/', '/storage/categories/');
                }
            }

            const title = category.meta_title || category.name + ' | ValoKichu';
            const description = category.meta_description || `Browse ${category.name} products.`;

            return {
                title,
                description,
                keywords: category.meta_keywords || '',
                openGraph: {
                    title,
                    description,
                    images: imageUrl ? [{ url: imageUrl }] : [],
                    type: 'website',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: imageUrl ? [imageUrl] : [],
                }
            };
        }
    }

    const defaultTitle = settings.products_page_title || 'Products | ValoKichu';
    const defaultDescription = settings.products_page_description || 'Browse our collection of high-quality products.';

    return {
        title: defaultTitle,
        description: defaultDescription,
        openGraph: {
            title: defaultTitle,
            description: defaultDescription,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: defaultTitle,
            description: defaultDescription,
        }
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
        <div className="container mx-auto px-4 pt-4 pb-8 md:py-8">
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">

                {/* Sidebar — takes no layout space on mobile (display:contents), full column on desktop */}
                <ClientSidebarWrapper categories={categories} />

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
