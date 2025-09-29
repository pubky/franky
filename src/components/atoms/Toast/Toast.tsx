'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastViewport = () => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-brand/20 outline-brand/80 text-white border shadow-[0px_4px_6px_0px_rgba(5,5,10,0.25)] shadow-[0px_10px_15px_0px_rgba(5,5,10,0.50)] backdrop-blur-[10px] rounded-lg p-6 pr-8 flex items-center justify-between gap-4 w-full overflow-hidden',
          description: 'text-sm opacity-90',
          actionButton:
            'bg-transparent border text-white hover:bg-white/10 inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          cancelButton:
            'bg-transparent border text-white hover:bg-white/10 inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          error: 'bg-red-500/20 outline-red-500/80',
          warning: 'bg-yellow-500/20 outline-yellow-500/80',
          success: 'bg-green-500/20 outline-green-500/80',
        },
      }}
    />
  );
};

// Keep the same interface for backward compatibility
const Toast = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastAction = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastClose = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastTitle = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastDescription = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export {
  type ToastProps,
  type ToastActionElement,
  type ToastVariant,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

type ToastProps = {
  children: React.ReactNode;
  variant?: ToastVariant;
};

type ToastActionElement = React.ReactElement;

type ToastVariant = 'default' | 'error' | 'warning';
