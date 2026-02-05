import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://valokichu.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/customer/', '/cart/', '/checkout/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
