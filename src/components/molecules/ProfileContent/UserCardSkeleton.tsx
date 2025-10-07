export function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#303034' }}></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 rounded w-24" style={{ backgroundColor: '#303034' }}></div>
          <div className="h-3 rounded w-16" style={{ backgroundColor: '#505054' }}></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <div className="h-6 rounded w-16" style={{ backgroundColor: '#505054' }}></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 rounded w-8" style={{ backgroundColor: '#707074' }}></div>
            <div className="h-3 rounded w-4" style={{ backgroundColor: '#707074' }}></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded" style={{ backgroundColor: '#303034' }}></div>
      </div>
    </div>
  );
}
