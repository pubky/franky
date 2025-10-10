export default function TaggedLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
