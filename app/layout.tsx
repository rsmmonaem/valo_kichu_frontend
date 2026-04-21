import Head from 'next/head';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

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
  maximumScale: 1,
};

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

import { SettingsProvider } from '@/context/SettingsContext';
import { UIProvider } from '@/context/UIContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className={`${inter.variable} min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased`} suppressHydrationWarning>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <UIProvider>
                <div suppressHydrationWarning={true}>
                  {children}
                </div>
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

