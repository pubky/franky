'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import * as App from '@/app';
import { USER_NAME_MIN_LENGTH, USER_NAME_MAX_LENGTH, USER_BIO_MAX_LENGTH } from '@/config';

import type { ProfileLink, UseProfileFormProps, UseProfileFormReturn, SubmitTextKey } from './useProfileForm.types';

const DEFAULT_LINKS: ProfileLink[] = [
  { label: 'WEBSITE', url: '' },
  { label: 'X (TWITTER)', url: '' },
];

const urlSchema = z.string().trim().url('Invalid URL');
const nameSchema = z
  .string()
  .trim()
  .min(USER_NAME_MIN_LENGTH, `Name must be at least ${USER_NAME_MIN_LENGTH} characters`)
  .max(USER_NAME_MAX_LENGTH, `Name must be no more than ${USER_NAME_MAX_LENGTH} characters`);
const bioSchema = z
  .string()
  .trim()
  .max(USER_BIO_MAX_LENGTH, `Bio must be no more than ${USER_BIO_MAX_LENGTH} characters`);

export function useProfileForm(props: UseProfileFormProps): UseProfileFormReturn {
  const { mode, pubky } = props;
  // Extract userDetails for edit mode to avoid object reference issues in useEffect
  const userDetails = props.mode === 'edit' ? props.userDetails : undefined;
  const setShowWelcomeDialog = props.mode === 'create' ? props.setShowWelcomeDialog : undefined;

  const router = useRouter();
  const { toast } = Molecules.useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate a stable initial username for create mode (only generated once)
  const initialUsername = useMemo(() => (mode === 'create' ? Libs.generateRandomUsername() : ''), [mode]);

  // Form state
  const [name, setName] = useState(initialUsername);
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<ProfileLink[]>(DEFAULT_LINKS);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [submitTextKey, setSubmitTextKey] = useState<SubmitTextKey>(mode === 'create' ? 'finish' : 'saveProfile');

  // Edit mode specific state
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);

  // Error state
  const [nameError, setNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
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
        const avatarUrl = Core.FileController.getAvatarUrl(pubky, userDetails.indexed_at);
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

  const validateBio = useCallback((value: string) => {
    if (value.trim().length === 0) {
      setBioError(null);
    } else {
      const res = bioSchema.safeParse(value);
      setBioError(res.success ? null : (res.error.issues[0]?.message ?? 'Invalid bio'));
    }
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
          case 'bio':
            setBioError(issue.message);
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
    setSubmitTextKey('saving');

    try {
      const user = validateUser();
      if (!user) {
        setSubmitTextKey(mode === 'create' ? 'finish' : 'saveProfile');
        return;
      }

      // Handle avatar upload
      let image: string | null = null;

      if (mode === 'create') {
        if (avatarFile) {
          setSubmitTextKey('uploadingAvatar');
          image = await Core.FileController.commitCreate({ file: avatarFile, pubky });
          if (!image) {
            setSubmitTextKey('tryAgain');
            return;
          }
        }
      } else {
        // Edit mode
        image = originalAvatarUrl ? (userDetails?.image ?? null) : null;

        if (avatarChanged) {
          if (avatarFile) {
            setSubmitTextKey('uploadingAvatar');
            const uploadedImage = await Core.FileController.commitCreate({ file: avatarFile, pubky });
            if (!uploadedImage) {
              setSubmitTextKey('tryAgain');
              return;
            }
            image = uploadedImage;
          } else {
            image = null;
          }
        }
      }

      setSubmitTextKey('savingProfile');

      if (mode === 'create') {
        await Core.ProfileController.commitCreate({ profile: user, image, pubky });
        await Core.AuthController.bootstrapWithDelay();
        setShowWelcomeDialog?.(true);
        router.push(App.HOME_ROUTES.HOME);
      } else {
        await Core.ProfileController.commitUpdate({
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
        if (Libs.requiresLogin(error)) {
          Libs.Logger.error('Session expired while saving profile', error);
          setSubmitTextKey('tryAgain');
          toast({
            title: 'Session expired',
            description: 'Please sign out and sign in again to continue.',
          });
          return;
        }

        // Handle auth errors from homeserver
        if (Libs.isAuthError(error)) {
          Libs.Logger.error('Failed to save profile in Homeserver', error);
          setSubmitTextKey('tryAgain');
          toast({
            title: 'Failed to save profile',
            description: 'Please try again.',
          });
          return;
        }
      }

      setSubmitTextKey('tryAgain');
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
    // Check if there's navigation history to go back to
    // history.length > 1 indicates the user has navigation history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to settings account page if no history (direct URL access)
      router.push(App.SETTINGS_ROUTES.ACCOUNT);
    }
  }, [router]);

  // Computed values
  const isSubmitDisabled =
    !!nameError ||
    name.trim().length < USER_NAME_MIN_LENGTH ||
    !!bioError ||
    Object.values(linkUrlErrors).some((m) => !!m) ||
    !!avatarError ||
    isSaving;

  return {
    state: {
      name,
      bio,
      links,
      avatarFile,
      avatarPreview,
      isSaving,
      isLoading,
      submitTextKey,
    },
    errors: {
      nameError,
      bioError,
      linkUrlErrors,
      avatarError,
    },
    handlers: {
      setName: (value: string) => {
        setName(value);
        validateName(value);
      },
      setBio: (value: string) => {
        setBio(value);
        validateBio(value);
      },
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
