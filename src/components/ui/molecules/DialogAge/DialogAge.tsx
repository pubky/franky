import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';

export function DialogAge({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="cursor-pointer text-brand">{linkText}</a>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Age minimum: 18</DialogTitle>
        </DialogHeader>
        <div className="h-full pr-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">You can only use Pubky if you are over 18 years old.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
