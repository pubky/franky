import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import * as Libs from '@/libs';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" data-testid="dialog" {...props} />;
}

function DialogTrigger({ asChild, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      data-testid="dialog-trigger"
      data-as-child={asChild ? 'true' : 'false'}
      asChild={asChild}
      {...props}
    />
  );
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close id="dialog-close-btn" data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={Libs.cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  hiddenTitle,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  hiddenTitle?: string;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0 sm:py-0">
        <DialogPrimitive.Content
          data-slot="dialog-content"
          data-testid="dialog-content"
          className={Libs.cn(
            'relative z-50 grid w-full max-h-[80vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
            className,
          )}
          {...props}
        >
          {hiddenTitle && <DialogPrimitive.Title className="sr-only">{hiddenTitle}</DialogPrimitive.Title>}
          {children}
          {showCloseButton && (
            <DialogClose className="absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-secondary text-sm text-secondary-foreground transition-all duration-300 ease-in-out hover:bg-secondary/80 disabled:pointer-events-none disabled:opacity-50 outline-none focus:outline-none">
              <Libs.X className="h-4 w-4 text-secondary-foreground opacity-70" />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      data-testid="dialog-header"
      className={Libs.cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={Libs.cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      data-testid="dialog-title"
      className={Libs.cn(
        `self-stretch justify-start text-base-foreground text-2xl font-bold leading-loose ${className}`,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={Libs.cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
