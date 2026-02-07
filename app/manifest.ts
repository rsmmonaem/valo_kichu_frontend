import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Valokichu - Premium Wholesale Marketplace',
        short_name: 'Valokichu',
        description: 'Connect directly with best manufacturers and wholesalers.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f97316',
        icons: [
            {
                src: '/fav1.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/fav1.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
