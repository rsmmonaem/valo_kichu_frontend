import { getProduct } from '@/lib/api';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Check if slug is valid
    if (!slug) return { title: 'Product Not Found' };

    const { data: product } = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');
    const rawImage = product.image_url || product.image;
    let imageUrl = '';
    if (rawImage) {
        if (rawImage.startsWith('http')) {
            imageUrl = rawImage;
        } else {
            imageUrl = `${baseUrl}/storage/products/${rawImage.replace(/^\/?(storage\/products|products)\/?/, '')}`;
        }
    }

    const title = product.meta_title || product.name || 'Product Details';
    const description = product.meta_description || product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || 'Product details';

    return {
        title,
        description,
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: product } = await getProduct(slug);

    if (!product || !product.id) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductDetails product={product} />
        </div>
    );
}
