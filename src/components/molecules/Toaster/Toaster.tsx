'use client';

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/atoms';
import { useToast } from './use-toast';

export function Toaster(): React.ReactElement {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            className="bg-black-900 flex items-center justify-between gap-4 rounded-lg border border-brand/16 p-6 text-white"
            {...props}
          >
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex w-full flex-col gap-1">
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
