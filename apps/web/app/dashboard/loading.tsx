export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      {/* Sleek Spinner */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-100 rounded-full"></div>
        <div className="w-10 h-10 border-4 border-[#ff4b2f] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-sm font-medium text-neutral-500 animate-pulse">Loading module...</p>
    </div>
  );
}
