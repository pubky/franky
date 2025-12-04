'use client';

import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';
import * as App from '@/app';

export const EditProfileForm = () => {
  const router = useRouter();
  const { toast } = Molecules.useToast();
  const { userDetails, currentUserPubky } = Hooks.useCurrentUserProfile();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saveText, setSaveText] = useState('Save');
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const urlSchema = z.string().trim().url('Invalid URL');

  const [nameError, setNameError] = useState<string | null>(null);
  const [linkUrlErrors, setLinkUrlErrors] = useState<Record<number, string | null>>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Load existing profile data
  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setBio(userDetails.bio || '');

      // Convert links from NexusUserLink format to form format
      const formattedLinks = (userDetails.links ?? []).map((link) => ({
        label: link.title.toUpperCase(),
        url: link.url,
      }));

      // If no links, add default empty ones
      if (formattedLinks.length === 0) {
        setLinks([
          { label: 'WEBSITE', url: '' },
          { label: 'X (TWITTER)', url: '' },
        ]);
      } else {
        setLinks(formattedLinks);
      }

      // Set avatar if exists
      if (userDetails.image && currentUserPubky) {
        const avatarUrl = Core.FileController.getAvatarUrl(currentUserPubky);
        setOriginalAvatarUrl(avatarUrl);
        setAvatarPreview(avatarUrl);
      }

      setIsLoading(false);
    }
  }, [userDetails, currentUserPubky]);

  useEffect(() => {
    return () => {
      // Only revoke if it's a blob URL (not the original avatar URL)
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    };
  }, [avatarPreview, pendingAvatarPreview]);

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setLinkUrlErrors({});
  };

  const handleDeleteAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarChanged(true);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetPendingAvatar = () => {
    if (pendingAvatarPreview) {
      URL.revokeObjectURL(pendingAvatarPreview);
    }
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
  };

  const handleCropCancel = () => {
    resetPendingAvatar();
    setCropDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropBack = () => {
    resetPendingAvatar();
    setCropDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleCropComplete = (file: File, previewUrl: string) => {
    resetPendingAvatar();
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setAvatarChanged(true);
    setCropDialogOpen(false);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateUser = () => {
    const { data, error } = Core.UserValidator.check(name, bio, links, avatarChanged ? avatarFile : null);

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
            // Handle URL errors with pattern 'url_0', 'url_1', etc.
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
  };

  const handleSave = async () => {
    if (!currentUserPubky) return;

    setIsSaving(true);
    setSaveText('Saving...');

    try {
      const user = validateUser();
      if (!user) {
        setSaveText('Save');
        return;
      }

      // Handle avatar upload if changed
      let image: string | null = originalAvatarUrl ? (userDetails?.image ?? null) : null;

      if (avatarChanged) {
        if (avatarFile) {
          setSaveText('Uploading avatar...');
          const uploadedImage = await Core.FileController.upload({ file: avatarFile, pubky: currentUserPubky });
          if (!uploadedImage) {
            setSaveText('Try again!');
            return;
          }
          image = uploadedImage;
        } else {
          // Avatar was deleted
          image = null;
        }
      }

      setSaveText('Saving profile...');

      await Core.ProfileController.updateProfile(user, image, currentUserPubky);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      router.push(App.PROFILE_ROUTES.PROFILE);
    } catch (error) {
      if (
        error instanceof Libs.AppError &&
        Object.values(Libs.HomeserverErrorType).includes(error.type as Libs.HomeserverErrorType)
      ) {
        Libs.Logger.error('Failed to save profile in Homeserver', error);
        setSaveText('Try again!');
        toast({
          title: 'Failed to save profile',
          description: 'Please try again.',
        });
        return;
      } else {
        setSaveText('Try again!');
        toast({
          title: 'Please try again.',
          description: 'Failed to update profile.',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(App.SETTINGS_ROUTES.ACCOUNT);
  };

  if (isLoading) {
    return (
      <Atoms.Container className="flex w-full flex-1 flex-col items-center justify-center gap-6">
        <Atoms.Spinner size="lg" />
        <Atoms.Typography>Loading profile...</Atoms.Typography>
      </Atoms.Container>
    );
  }

  return (
    <>
      <Atoms.Container className="flex w-full flex-1 flex-col gap-6 lg:flex-none" data-testid="edit-profile-form">
        <Atoms.Card className="rounded-md bg-card p-6 md:p-12 lg:flex lg:flex-row lg:gap-12">
          {/* Profile Section */}
          <Atoms.Container className="w-full gap-6">
            <Atoms.Container className="gap-3">
              <Atoms.Heading level={3} size="xl" className="text-2xl">
                Profile
              </Atoms.Heading>
            </Atoms.Container>

            <Atoms.Container className="gap-6">
              <Atoms.Container className="gap-2">
                <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground">NAME*</Atoms.Label>
                <Molecules.InputField
                  id="profile-name-input"
                  placeholder="Blue-Rabbit-Hat"
                  variant="dashed"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    const res = z.string().trim().min(3, 'Name must be at least 3 characters').safeParse(value);
                    setNameError(res.success ? null : (res.error.issues[0]?.message ?? 'Invalid name'));
                  }}
                  status={nameError ? 'error' : 'default'}
                  message={nameError ?? undefined}
                  messageType={nameError ? 'error' : 'default'}
                />
              </Atoms.Container>

              <Atoms.Container className="gap-2">
                <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground">BIO</Atoms.Label>
                <Molecules.TextareaField
                  id="profile-bio-input"
                  placeholder="Tell a bit about yourself."
                  value={bio}
                  variant="dashed"
                  rows={40}
                  onChange={(e) => setBio(e.target.value)}
                />
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>

          {/* Links Section */}
          <Atoms.Container className="mt-6 w-full gap-6 lg:mt-0">
            <Atoms.Container className="gap-3">
              <Atoms.Heading level={3} size="xl" className="text-2xl">
                Links
              </Atoms.Heading>
            </Atoms.Container>

            <Atoms.Container className="gap-6">
              {links.map((link, index) => (
                <Atoms.Container className="gap-2" key={`${link.label}-${index}`}>
                  <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {link.label}
                  </Atoms.Label>
                  <Molecules.InputField
                    id={`profile-links-input-${index}`}
                    placeholder={link.label.toUpperCase().includes('TWITTER') ? '@user' : 'https://'}
                    value={link.url}
                    variant="dashed"
                    onChange={(e) => {
                      const value = e.target.value;
                      setLinks(links.map((l, i) => (i === index ? { ...l, url: value } : l)));
                      if (value.trim().length === 0) {
                        setLinkUrlErrors((prev) => ({ ...prev, [index]: null }));
                      } else {
                        const res = urlSchema.safeParse(value);
                        setLinkUrlErrors((prev) => ({
                          ...prev,
                          [index]: res.success ? null : (res.error.issues[0]?.message ?? 'Invalid URL'),
                        }));
                      }
                    }}
                    icon={<Libs.Trash2 className="h-4 w-4" />}
                    onClickIcon={() => handleDeleteLink(index)}
                    iconPosition="right"
                    status={linkUrlErrors[index] ? 'error' : 'default'}
                    message={linkUrlErrors[index] ?? undefined}
                    messageType={linkUrlErrors[index] ? 'error' : 'default'}
                  />
                </Atoms.Container>
              ))}

              <Organisms.DialogAddLink
                onSave={(label, url) => {
                  setLinks([...links, { label, url }]);
                }}
              />
            </Atoms.Container>
          </Atoms.Container>

          {/* Avatar Section */}
          <Atoms.Container className="mt-6 w-full gap-6 lg:mt-0">
            <Atoms.Container className="gap-3 md:text-center">
              <Atoms.Heading level={3} size="xl" className="text-2xl">
                Avatar
              </Atoms.Heading>
            </Atoms.Container>

            <Atoms.Container className="flex-row justify-center">
              <Atoms.Avatar
                key={avatarPreview ? 'with-image' : 'without-image'}
                className="h-48 w-48 cursor-pointer bg-muted"
                onClick={handleChooseFileClick}
                role="button"
                aria-label="Choose avatar image"
              >
                {avatarPreview ? (
                  <Atoms.AvatarImage
                    src={avatarPreview}
                    alt={avatarFile ? `Selected avatar preview: ${avatarFile.name}` : 'Current avatar'}
                  />
                ) : (
                  <Atoms.AvatarFallback className="text-4xl">
                    {name ? name.substring(0, 2).toUpperCase() : 'SN'}
                  </Atoms.AvatarFallback>
                )}
              </Atoms.Avatar>
            </Atoms.Container>

            <Atoms.Container className="justify-center">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Atoms.Button
                variant="secondary"
                size="sm"
                className="mx-auto rounded-full"
                onClick={avatarPreview ? handleDeleteAvatar : handleChooseFileClick}
              >
                {avatarPreview ? (
                  <>
                    <Libs.Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                ) : (
                  <>
                    <Libs.File className="h-4 w-4" />
                    <span>Choose file</span>
                  </>
                )}
              </Atoms.Button>
              {avatarError && (
                <Atoms.Typography as="small" size="sm" className="ml-1 text-red-500">
                  {avatarError}
                </Atoms.Typography>
              )}
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Card>

        {/* Navigation Buttons */}
        <Atoms.Container className="mt-auto flex-row justify-end gap-4">
          <Atoms.Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Atoms.Button>
          <Atoms.Button
            onClick={handleSave}
            disabled={
              !!nameError ||
              name.trim().length < 3 ||
              Object.values(linkUrlErrors).some((m) => !!m) ||
              !!avatarError ||
              isSaving
            }
            data-testid="save-profile-button"
          >
            {isSaving && <Atoms.Spinner size="sm" className="mr-2" />}
            {saveText}
          </Atoms.Button>
        </Atoms.Container>
      </Atoms.Container>

      <Organisms.DialogCropImage
        open={cropDialogOpen}
        imageSrc={pendingAvatarPreview}
        fileName={pendingAvatarFile?.name ?? 'avatar.png'}
        fileType={pendingAvatarFile?.type ?? 'image/png'}
        onClose={handleCropCancel}
        onBack={handleCropBack}
        onCrop={handleCropComplete}
      />
    </>
  );
};
