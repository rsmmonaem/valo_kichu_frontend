import Head from 'next/head';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Valokichu - Premium Wholesale Marketplace',
  description: 'Connect directly with best manufacturers.',
  icons: {
    icon: '/fav.png',  // PNG file
    apple: '/fav.png', // optional for iOS devices
  },
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
    <html lang="en">

      <body className={`${inter.variable} min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased`}>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <UIProvider>
                {children}
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

