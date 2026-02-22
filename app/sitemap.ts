import { MetadataRoute } from 'next'
import { getCategoryList, getProducts, Product, Category } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://valokichu.com'

    // Fetch all categories
    const categoriesRes = await getCategoryList()
    const categories = categoriesRes.data || []

    // Fetch products
    let allProducts: Product[] = []
    try {
        const productsRes = await getProducts(1)
        if (productsRes.data && productsRes.data.data) {
            allProducts = productsRes.data.data

            const lastPage = productsRes.data.last_page
            if (lastPage > 1) {
                // Fetch up to 20 pages for a more comprehensive sitemap
                const maxPages = Math.min(lastPage, 20)
                for (let i = 2; i <= maxPages; i++) {
                    const nextRes = await getProducts(i)
                    if (nextRes.data && nextRes.data.data) {
                        allProducts = [...allProducts, ...nextRes.data.data]
                    }
                }
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

    const staticEndpoints = [
        { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
        { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' as const },
        { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: 'weekly' as const },
        { url: `${baseUrl}/dropshipper`, priority: 0.8, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/dropshipper/signup`, priority: 0.8, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/register`, priority: 0.5, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/login`, priority: 0.5, changeFrequency: 'monthly' as const },
    ]

    return [
        ...staticEndpoints.map(page => ({
            ...page,
            lastModified: new Date(),
        })),
        ...categoryEntries,
        ...productEntries,
    ]
}
