export default function RepliesLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
