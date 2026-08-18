export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
      {/* Top Banner/Hero Skeleton */}
      <div className="h-[180px] md:h-[320px] bg-gray-200 rounded-2xl w-full"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Area (Dynamic Grid) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="aspect-video bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar/Summary Card Skeleton */}
        <div className="col-span-12 md:col-span-4 border border-gray-150 rounded-xl p-4 space-y-4 bg-white h-fit">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
