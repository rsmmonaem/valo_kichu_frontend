import { MetadataRoute } from 'next'
import { getCategoryList, getProducts, Product, Category } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://valokichu.com'

    // Fetch all categories
    const categoriesRes = await getCategoryList()
    const categories = categoriesRes.data || []

    // Fetch products (at least first page for now, or loop if needed)
    // To avoid hitting API limits or slow builds, we can fetch the first page or a larger batch if the API supports it.
    // For a truly dynamic sitemap, we ideally want all products.
    let allProducts: Product[] = []
    try {
        const productsRes = await getProducts(1)
        allProducts = productsRes.data.data

        // If there are more pages, we could fetch them here, but for many products it might be better 
        // to keep it to the most recent ones or implement a more robust fetcher.
        const lastPage = productsRes.data.last_page
        if (lastPage > 1) {
            for (let i = 2; i <= Math.min(lastPage, 5); i++) { // Limit to 5 pages for safety in build time
                const nextRes = await getProducts(i)
                allProducts = [...allProducts, ...nextRes.data.data]
            }
        }
    } catch (error) {
        console.error('Sitemap product fetch error:', error)
    }

    const categoryEntries = categories.map((category: Category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const productEntries = allProducts.map((product: Product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...categoryEntries,
        ...productEntries,
    ]
}
