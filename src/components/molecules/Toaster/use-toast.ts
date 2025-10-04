'use client';

import { toast as sonnerToast } from 'sonner';
import * as React from 'react';

type ToastVariant = 'default' | 'error' | 'warning' | 'success';

type Toast = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
};

function toast({ title, description, action, ...props }: Toast) {
  return sonnerToast(title, {
    description: description,
    action: action,
    ...props,
  });
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },
  };
}

export { useToast, toast };
