export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      {/* Spinner */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"></div>
      </div>

      {/* Text */}
      <p className="mt-4 text-sm font-semibold tracking-wide text-orange-500 animate-pulse">
        Loading, please wait...
      </p>
    </div>
  );
}
