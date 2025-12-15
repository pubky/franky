'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as App from '@/app';

import type { ProfileLink, UseProfileFormProps, UseProfileFormReturn } from './useProfileForm.types';

const DEFAULT_LINKS: ProfileLink[] = [
  { label: 'WEBSITE', url: '' },
  { label: 'X (TWITTER)', url: '' },
];

const urlSchema = z.string().trim().url('Invalid URL');
const nameSchema = z.string().trim().min(3, 'Name must be at least 3 characters');

export function useProfileForm(props: UseProfileFormProps): UseProfileFormReturn {
  const { mode, pubky } = props;
  // Extract userDetails for edit mode to avoid object reference issues in useEffect
  const userDetails = props.mode === 'edit' ? props.userDetails : undefined;
  const setShowWelcomeDialog = props.mode === 'create' ? props.setShowWelcomeDialog : undefined;

  const router = useRouter();
  const { toast } = Molecules.useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<ProfileLink[]>(DEFAULT_LINKS);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [submitText, setSubmitText] = useState(mode === 'create' ? 'Finish' : 'Save Profile');

  // Edit mode specific state
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);

  // Error state
  const [nameError, setNameError] = useState<string | null>(null);
  const [linkUrlErrors, setLinkUrlErrors] = useState<Record<number, string | null>>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Load existing profile data (edit mode only)
  useEffect(() => {
    if (mode === 'edit' && userDetails) {
      setName(userDetails.name || '');
      setBio(userDetails.bio || '');

      // Convert links from NexusUserLink format to form format
      const formattedLinks = (userDetails.links ?? []).map((link) => ({
        label: link.title.toUpperCase(),
        url: link.url,
      }));

      setLinks(formattedLinks.length > 0 ? formattedLinks : DEFAULT_LINKS);

      // Set avatar if exists
      if (userDetails.image && pubky) {
        const avatarUrl = Core.FileController.getAvatarUrl(pubky);
        setOriginalAvatarUrl(avatarUrl);
        setAvatarPreview(avatarUrl);
      }

      setIsLoading(false);
    }
  }, [mode, userDetails, pubky]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    };
  }, [avatarPreview, pendingAvatarPreview]);

  // Validation helpers
  const validateName = useCallback((value: string) => {
    const res = nameSchema.safeParse(value);
    setNameError(res.success ? null : (res.error.issues[0]?.message ?? 'Invalid name'));
  }, []);

  const validateLinkUrl = useCallback((value: string, index: number) => {
    if (value.trim().length === 0) {
      setLinkUrlErrors((prev) => ({ ...prev, [index]: null }));
    } else {
      const res = urlSchema.safeParse(value);
      setLinkUrlErrors((prev) => ({
        ...prev,
        [index]: res.success ? null : (res.error.issues[0]?.message ?? 'Invalid URL'),
      }));
    }
  }, []);

  const validateUser = useCallback(() => {
    const avatarToValidate = mode === 'edit' && !avatarChanged ? null : avatarFile;
    const { data, error } = Core.UserValidator.check(name, bio, links, avatarToValidate);

    if (error.length > 0) {
      for (const issue of error) {
        switch (issue.type) {
          case 'name':
            setNameError(issue.message);
            break;
          case 'avatar':
            setAvatarError(issue.message);
            break;
          default:
            if (issue.type.startsWith('link_')) {
              const linkIndex = parseInt(issue.type.split('_')[1], 10);
              if (!isNaN(linkIndex)) {
                setLinkUrlErrors((prev) => ({ ...prev, [linkIndex]: issue.message }));
              }
            }
            break;
        }
      }
      return;
    }

    return data;
  }, [mode, avatarChanged, avatarFile, name, bio, links]);

  // File handlers
  const handleChooseFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setAvatarError('Avatar must be an image file');
        return;
      }

      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);

      const nextPreview = URL.createObjectURL(file);
      setPendingAvatarFile(file);
      setPendingAvatarPreview(nextPreview);
      setCropDialogOpen(true);
      setAvatarError(null);
    },
    [pendingAvatarPreview],
  );

  const resetPendingAvatar = useCallback(() => {
    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
    }
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
  }, [pendingAvatarPreview]);

  const handleDeleteLink = useCallback((index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
    setLinkUrlErrors({});
  }, []);

  const handleDeleteAvatar = useCallback(() => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    if (mode === 'edit') {
      setAvatarChanged(true);
    }
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [avatarPreview, mode]);

  const handleCropCancel = useCallback(() => {
    resetPendingAvatar();
    setCropDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetPendingAvatar]);

  const handleCropBack = useCallback(() => {
    resetPendingAvatar();
    setCropDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, [resetPendingAvatar]);

  const handleCropComplete = useCallback(
    (file: File, previewUrl: string) => {
      resetPendingAvatar();
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
      if (mode === 'edit') {
        setAvatarChanged(true);
      }
      setCropDialogOpen(false);
      setAvatarError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [resetPendingAvatar, avatarPreview, mode],
  );

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!pubky) return;

    setIsSaving(true);
    setSubmitText('Saving...');

    try {
      const user = validateUser();
      if (!user) {
        setSubmitText(mode === 'create' ? 'Finish' : 'Save Profile');
        return;
      }

      // Handle avatar upload
      let image: string | null = null;

      if (mode === 'create') {
        if (avatarFile) {
          setSubmitText('Uploading avatar...');
          image = await Core.FileController.upload({ file: avatarFile, pubky });
          if (!image) {
            setSubmitText('Try again!');
            return;
          }
        }
      } else {
        // Edit mode
        image = originalAvatarUrl ? (userDetails?.image ?? null) : null;

        if (avatarChanged) {
          if (avatarFile) {
            setSubmitText('Uploading avatar...');
            const uploadedImage = await Core.FileController.upload({ file: avatarFile, pubky });
            if (!uploadedImage) {
              setSubmitText('Try again!');
              return;
            }
            image = uploadedImage;
          } else {
            image = null;
          }
        }
      }

      setSubmitText('Saving profile...');

      if (mode === 'create') {
        await Core.ProfileController.commitSetDetails({ profile: user, image, pubky });
        await Core.AuthController.bootstrapWithDelay();
        setShowWelcomeDialog?.(true);
        router.push(App.HOME_ROUTES.HOME);
      } else {
        await Core.ProfileController.commitUpdateDetails({
          name: user.name,
          bio: user.bio,
          links: user.links,
          image,
          pubky,
        });
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
        router.push(App.PROFILE_ROUTES.PROFILE);
      }
    } catch (error) {
      if (error instanceof Libs.AppError) {
        // Handle session expiration - user needs to re-authenticate
        if (error.type === Libs.HomeserverErrorType.SESSION_EXPIRED) {
          Libs.Logger.error('Session expired while saving profile', error);
          setSubmitText('Try again!');
          toast({
            title: 'Session expired',
            description: 'Please sign out and sign in again to continue.',
          });
          return;
        }

        // Handle other homeserver errors
        if (Object.values(Libs.HomeserverErrorType).includes(error.type as Libs.HomeserverErrorType)) {
          Libs.Logger.error('Failed to save profile in Homeserver', error);
          setSubmitText('Try again!');
          toast({
            title: 'Failed to save profile',
            description: 'Please try again.',
          });
          return;
        }
      }

      setSubmitText('Try again!');
      toast({
        title: 'Please try again.',
        description:
          mode === 'create'
            ? 'Failed to fetch the new user data. Indexing might be in progress...'
            : 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    pubky,
    mode,
    validateUser,
    avatarFile,
    avatarChanged,
    originalAvatarUrl,
    userDetails,
    setShowWelcomeDialog,
    router,
    toast,
  ]);

  const handleCancel = useCallback(() => {
    router.push(App.SETTINGS_ROUTES.ACCOUNT);
  }, [router]);

  // Computed values
  const isSubmitDisabled =
    !!nameError || name.trim().length < 3 || Object.values(linkUrlErrors).some((m) => !!m) || !!avatarError || isSaving;

  return {
    state: {
      name,
      bio,
      links,
      avatarFile,
      avatarPreview,
      isSaving,
      isLoading,
      submitText,
    },
    errors: {
      nameError,
      linkUrlErrors,
      avatarError,
    },
    handlers: {
      setName: (value: string) => {
        setName(value);
        validateName(value);
      },
      setBio,
      setLinks,
      handleChooseFileClick,
      handleFileChange,
      handleDeleteLink,
      handleDeleteAvatar,
      handleCropCancel,
      handleCropBack,
      handleCropComplete,
      handleSubmit,
      handleCancel,
      validateLinkUrl,
      validateName,
    },
    cropDialog: {
      cropDialogOpen,
      pendingAvatarFile,
      pendingAvatarPreview,
    },
    fileInputRef,
    isSubmitDisabled,
  };
}
