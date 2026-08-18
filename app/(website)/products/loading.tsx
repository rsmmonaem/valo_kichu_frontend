export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Page Title skeleton */}
      <div className="h-7 bg-gray-200 rounded w-1/4 mb-8"></div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters Skeleton */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid Skeleton */}
        <main className="flex-1 space-y-6">
          {/* Header controls skeleton */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 space-y-3">
                <div className="aspect-square bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
