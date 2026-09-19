import { getProduct } from '@/lib/api';
import ProductDetails from '@/components/ProductDetails';
import RecommendedProducts from '@/components/RecommendedProducts';
import { notFound } from 'next/navigation';
import { getImageUrl, parseGalleryImages } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Check if slug is valid
    if (!slug) return { title: 'Product Not Found' };

    const { data: product } = await getProduct(slug);

    if (!product || !product.id) {
        return {
            title: 'Product Not Found',
        };
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');

    // Get 1st image of the product (image_url, image, or first gallery image)
    const galleryArray = parseGalleryImages(product.gallery_images) || [];
    const firstGalleryImage = (product.gallery_image_urls && product.gallery_image_urls.length > 0)
        ? product.gallery_image_urls[0]
        : (galleryArray.length > 0 ? galleryArray[0] : null);

    const rawImage = product.meta_image || product.image_url || product.image || firstGalleryImage;
    let imageUrl = '';
    if (rawImage) {
        let cleanUrl = rawImage;
        if (!rawImage.startsWith('http')) {
            cleanUrl = `${baseUrl}/storage/products/${rawImage.replace(/^\/?(storage\/products|products)\/?/, '')}`;
        }
        imageUrl = getImageUrl(cleanUrl);
    }

    const title = product.meta_title || product.name || 'Product Details';
    const description = product.meta_description || product.description
        ?.replace(/<[^>]*>?/gm, '')
        ?.replace(/&nbsp;/g, ' ')
        ?.replace(/\s+/g, ' ')
        ?.trim()
        ?.substring(0, 160) || 'Product details';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: imageUrl ? [
                {
                    url: imageUrl,
                    secureUrl: imageUrl,
                    alt: title,
                }
            ] : [],
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
        <div className="container mx-auto px-4 py-4 md:py-6">
            <ProductDetails product={product} />
            <RecommendedProducts currentProduct={product} />
        </div>
    );
}
