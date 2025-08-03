'use client';

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './Toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            className="flex items-center justify-between gap-4 p-6 rounded-lg bg-black-900 border border border-brand/20 text-white"
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
