function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
      <div className="h-40 bg-slate-800 rounded-xl mb-5" />

      <div className="h-4 bg-slate-800 rounded w-2/3 mb-3" />
      <div className="h-4 bg-slate-800 rounded w-1/2 mb-5" />

      <div className="grid grid-cols-3 gap-3">
        <div className="h-10 bg-slate-800 rounded-lg" />
        <div className="h-10 bg-slate-800 rounded-lg" />
        <div className="h-10 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonArtistCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl" />

        <div className="flex-1">
          <div className="h-4 bg-slate-800 rounded w-24 mb-3" />
          <div className="h-5 bg-slate-800 rounded w-40 mb-3" />
          <div className="h-4 bg-slate-800 rounded w-28" />
        </div>
      </div>

      <div className="h-4 bg-slate-800 rounded w-full mb-3" />
      <div className="h-4 bg-slate-800 rounded w-5/6 mb-6" />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-800 rounded-xl" />
        <div className="h-16 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonGrid({ type = 'card', count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) =>
        type === 'artist' ? (
          <SkeletonArtistCard key={index} />
        ) : (
          <SkeletonCard key={index} />
        )
      )}
    </div>
  );
}

export { SkeletonCard, SkeletonArtistCard, SkeletonGrid };