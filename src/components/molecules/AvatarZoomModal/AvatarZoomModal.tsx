'use client';

import { useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';

export interface AvatarZoomModalProps {
  open: boolean;
  onClose: () => void;
  avatarUrl?: string;
  name: string;
}

export function AvatarZoomModal({ open, onClose, avatarUrl, name }: AvatarZoomModalProps) {
  Hooks.useBodyScrollLock(open);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Atoms.Container
      overrideDefaults={true}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-testid="avatar-zoom-modal-overlay"
    >
      <Atoms.Container
        overrideDefaults={true}
        className="relative"
        onClick={(e) => e.stopPropagation()}
        data-testid="avatar-zoom-modal-content"
      >
        <Molecules.AvatarWithFallback
          avatarUrl={avatarUrl}
          name={name}
          className="size-(--avatar-zoom-size)"
          fallbackClassName="text-6xl"
          alt={`${name}'s avatar`}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
}
