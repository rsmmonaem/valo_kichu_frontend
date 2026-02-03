import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export const metadata = {
    title: 'My Wishlist | Valokichu',
    description: 'View your favorite products.',
};

export default function WishlistPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                Looks like you haven't added any items to your wishlist yet. Start browsing and add your favorite items!
            </p>
            <Link
                href="/products"
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
            >
                Start Shopping
            </Link>
        </div>
    );
}
