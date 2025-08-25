'use client';

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/atoms';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast
            key={id}
            variant={variant}
            {...props}
          >
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex flex-col gap-1 w-full">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              <div className="flex items-center justify-between gap-4">{action}</div>
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
