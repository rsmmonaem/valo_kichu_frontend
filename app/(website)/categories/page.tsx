import { getCategoryList } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
    title: 'Categories | Valokichu',
    description: 'Browse products by category.',
};

export default async function CategoriesPage() {
    const { data: categories } = await getCategoryList();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Browse Categories</h1>

            {/* Main Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories && categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug || cat.id}`}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 p-6 flex flex-col items-center text-center gap-4"
                    >
                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-gray-50 group-hover:border-[#FFAC1C] transition-colors duration-300">
                            {cat.image ? (
                                <img
                                    src={cat.image.startsWith('http') ? cat.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/${cat.image}`}
                                    alt={cat.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-gray-300 group-hover:text-[#FFAC1C] transition-colors">
                                    {cat.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {cat.name}
                        </h2>
                    </Link>
                ))}
            </div>

            {(!categories || categories.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                    No categories found.
                </div>
            )}
        </div>
    );
}
