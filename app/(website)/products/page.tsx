import { getProducts, getSettings, getCategory } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Metadata } from 'next';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const categorySlug = params.category as string;
    const settings = await getSettings();

    if (categorySlug) {
        // If viewing a category, try to get specific category SEO
        const { data: category } = await getCategory(categorySlug);
        if (category && category.id) {
            return {
                title: category.meta_title || category.name + ' | ValoKichu',
                description: category.meta_description || `Browse ${category.name} products.`,
                keywords: category.meta_keywords || ''
            };
        }
    }

    // Default to Products Page Global settings
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

    // Fetch products with filters
    const response = await getProducts(page, categorySlug, search);
    const products = response.data?.data || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
                {search ? `Search Results for "${search}"` :
                    categorySlug ? `Products in "${categorySlug}"` :
                        "Our Products"}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-1">
                            {search ? `We couldn't find any products matching "${search}"` : "Try adjusting your filters or check back later."}
                        </p>
                        <a href="/products" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                            Clear Filters
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
