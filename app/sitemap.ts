import { MetadataRoute } from 'next'
import { getCategoryList, getProducts, getBlogs, Product, Category, Blog } from '@/lib/api'

export const dynamic = 'force-dynamic';

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
                // Fetch up to 3 pages during generation to prevent build timeouts
                const maxPages = Math.min(lastPage, 3)
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

    // Fetch blogs
    let allBlogs: Blog[] = []
    try {
        allBlogs = await getBlogs()
    } catch (error) {
        console.error('Sitemap blogs fetch error:', error)
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

    const blogEntries = allBlogs.map((blog: Blog) => ({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const staticEndpoints = [
        { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
        { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: 'daily' as const },
        { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: 'weekly' as const },
        { url: `${baseUrl}/blogs`, priority: 0.8, changeFrequency: 'daily' as const },
        { url: `${baseUrl}/dropshipper`, priority: 0.8, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/dropshipper/signup`, priority: 0.8, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/returns`, priority: 0.5, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/shipping`, priority: 0.5, changeFrequency: 'monthly' as const },
        { url: `${baseUrl}/track-order`, priority: 0.6, changeFrequency: 'monthly' as const },
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
        ...blogEntries,
    ]
}
