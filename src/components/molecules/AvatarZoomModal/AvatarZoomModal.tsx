'use client';

import { useEffect, useRef } from 'react';
import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
// Direct import to avoid circular dependency with @/molecules barrel export
// Since AvatarZoomModal is exported from @/molecules, importing from the barrel
// would create a circular reference that could cause undefined imports
import { AvatarWithFallback } from '../AvatarWithFallback/AvatarWithFallback';

export interface AvatarZoomModalProps {
  open: boolean;
  onClose: () => void;
  avatarUrl?: string;
  name: string;
}

/**
 * Modal component that displays an enlarged version of a user's avatar.
 * Handles backdrop clicks, escape key, and scroll locking.
 *
 * @param open - Controls modal visibility
 * @param onClose - Callback when user closes modal (backdrop click or Escape)
 * @param avatarUrl - Optional URL to avatar image
 * @param name - User's name for fallback initials and alt text
 */
export function AvatarZoomModal({ open, onClose, avatarUrl, name }: AvatarZoomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  Hooks.useBodyScrollLock(open);

  // Focus management: move focus into modal when it opens
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation: close on Escape
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
      ref={modalRef}
      overrideDefaults={true}
      role="dialog"
      aria-modal="true"
      aria-label={`${name}'s avatar enlarged`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 duration-200 outline-none fade-in"
      onClick={onClose}
      data-testid="avatar-zoom-modal-overlay"
    >
      <Atoms.Container
        overrideDefaults={true}
        className="relative animate-in duration-200 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        data-testid="avatar-zoom-modal-content"
      >
        <AvatarWithFallback
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
