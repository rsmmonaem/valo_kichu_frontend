import Head from 'next/head';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export const metadata: Metadata = {
  title: 'Valokichu - Premium Wholesale Marketplace',
  description: 'Connect directly with best manufacturers.',
  keywords: [
    'wholesale marketplace',
    'b2b marketplace',
    'bulk products',
    'wholesale ecommerce',
    'manufacturer to retailer',
    'direct from manufacturers',
    'online wholesale platform',
    'business to business ecommerce',
    'global wholesale market',
    'bulk buying platform',
    'supplier marketplace',
    'wholesale suppliers',
    'trade marketplace',
    'Valokichu'
  ],

  verification: {
    google: 'wBgt_-cjgzjf8qCBOdlubW9YH3IJwzBouZ9w_FFq6i0',
  },
  icons: {
    icon: '/fav1.png',
    apple: '/fav1.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Valokichu',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

import { SettingsProvider } from '@/context/SettingsContext';
import { UIProvider } from '@/context/UIContext';
import FacebookPixel from '@/components/FacebookPixel';
import VisitorTracker from '@/components/VisitorTracker';

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect & DNS-Prefetch for Key Origins */}
        <link rel="preconnect" href="https://backend.valokichu.com" />
        <link rel="dns-prefetch" href="https://backend.valokichu.com" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://scripts.clarity.ms" crossOrigin="anonymous" />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WW3R96DZ');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>

      <body className={`${inter.variable} min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WW3R96DZ"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <FacebookPixel />
        <SettingsProvider>
          <AuthProvider>
            <VisitorTracker />
            <CartProvider>
              <WishlistProvider>
                <UIProvider>
                  <div suppressHydrationWarning={true}>
                    {children}
                  </div>
                </UIProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>

        {/* Enterprise AI Commerce Chatbot Widget */}
        <Script src="https://aichat-backend.npms.pro/static/widget.js" strategy="lazyOnload" />
        <Script id="enterprise-ai-chatbot" strategy="lazyOnload">
          {`
            setTimeout(function() {
              if (window.EnterpriseChatWidget) {
                EnterpriseChatWidget.init({
              widgetKey: "wgt_d14f331341854644be",
              apiUrl: "https://aichat-backend.npms.pro/api/v1"
            });

            // Adjust chatbot position on mobile to avoid bottom nav bar
            setTimeout(() => {
              const host = document.getElementById("aiaas-widget-host");
              if (host && host.shadowRoot) {
                const style = document.createElement("style");
                style.textContent = "@media (max-width: 768px) { .aiaas-launcher { bottom: 85px !important; } .aiaas-window { bottom: 85px !important; } }";
                host.shadowRoot.appendChild(style);
              }
            }, 2000);
              }
            }, 1000);
          `}
        </Script>
      </body>
    </html>
  );
}

