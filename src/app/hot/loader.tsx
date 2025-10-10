import * as Libs from '@/libs';

export default function HotLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Libs.Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
