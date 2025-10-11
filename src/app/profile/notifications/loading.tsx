export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
