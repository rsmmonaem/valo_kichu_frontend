import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import FloatingContact from '@/components/FloatingContact';
import { getCategoryList, getSettings } from '@/lib/api';
import Script from 'next/script';
import { getImageUrl } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
    let settings = {
        site_title: 'Valokichu - Premium Wholesale Marketplace',
        site_description: 'Connect directly with best manufacturers.',
        site_keywords: 'wholesale, marketplace, ecommerce',
        site_logo: '',
        site_share_image: ''
    };

    try {
        const settingsMap = await getSettings({ next: { revalidate: 60 } } as any);
        if (settingsMap.site_title) settings.site_title = settingsMap.site_title;
        if (settingsMap.site_description) settings.site_description = settingsMap.site_description;
        if (settingsMap.site_keywords) settings.site_keywords = settingsMap.site_keywords;
        if (settingsMap.site_logo) settings.site_logo = settingsMap.site_logo;
        if (settingsMap.site_share_image) settings.site_share_image = settingsMap.site_share_image;
    } catch (e) {
        console.error('Metadata fetch failed', e);
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://backend.valokichu.com').replace(/\/api\/?$/, '');

    // Prefer site_share_image, fall back to site_logo
    const rawImage = settings.site_share_image || settings.site_logo;
    let shareImageUrl = '';
    if (rawImage) {
        let cleanUrl = rawImage;
        if (!rawImage.startsWith('http')) {
            cleanUrl = `${baseUrl}/storage/${rawImage.replace(/^\/?storage\/?/, '')}`;
        }
        shareImageUrl = getImageUrl(cleanUrl);
    }

    return {
        title: settings.site_title,
        description: settings.site_description,
        keywords: settings.site_keywords ? settings.site_keywords.split(',') : [],
        openGraph: {
            title: settings.site_title,
            description: settings.site_description,
            images: shareImageUrl ? [{ url: shareImageUrl }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: settings.site_title,
            description: settings.site_description,
            images: shareImageUrl ? [shareImageUrl] : [],
        }
    };
}

export default async function WebsiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data: categories } = await getCategoryList();
    const settingsMap = await getSettings({ next: { revalidate: 60 } } as any);
    const googleAnalyticsId = settingsMap.google_analytics_id;

    return (
        <>
            {googleAnalyticsId && (
                <>
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            gtag('config', '${googleAnalyticsId}');
                        `}
                    </Script>
                </>
            )}
            <Header categories={categories || []} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <FloatingContact />
        </>
    );
}
