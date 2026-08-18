export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
          {/* Image Gallery Skeleton */}
          <div className="p-2 md:p-8 bg-white space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl w-full"></div>
            <div className="flex gap-2">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Title */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            
            {/* Category / Code */}
            <div className="flex gap-2 mb-6">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Price */}
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>

            {/* Selector Options Skeletons */}
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="flex gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="flex gap-2">
                  <div className="w-14 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-14 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 mt-auto">
              <div className="flex gap-4">
                <div className="w-32 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
