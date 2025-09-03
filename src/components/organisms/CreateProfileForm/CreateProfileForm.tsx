'use client';

import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

export const CreateProfileForm = () => {
  const router = useRouter();
  const { publicKey } = Core.useOnboardingStore();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [continueText, setContinueText] = useState('Finish');
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: 'WEBSITE', url: '' },
    { label: 'X (TWITTER)', url: '' },
  ]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const urlSchema = z.string().trim().url('Invalid URL');

  const [nameError, setNameError] = useState<string | null>(null);
  const [linkUrlErrors, setLinkUrlErrors] = useState<Record<number, string | null>>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

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

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const nextPreview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(nextPreview);
    setAvatarError(null);
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setLinkUrlErrors({});
  };

  const handleDeleteAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateUser = () => {
    const { data, error } = Core.UserValidator.check(name, bio, links, avatarFile);

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

  const handleContinue = async () => {
    // TODO: Maybe wrap in TRY/CATCH/FINALLY block?
    setIsSaving(true);
    setContinueText('Saving...');
    const user = validateUser();

    if (!user) return;

    // TODO: maybe optimistically upload to homeserver the avatar image when the user selects the file
    //       and save the state of the avatar file and the preview image in the store
    let image: string | null = null;
    if (avatarFile) {
      setContinueText('Uploading avatar...');
      if (!avatarFile) return null;
      image = await Core.UserController.uploadAvatar(avatarFile, publicKey);
      if (!image) return;
    }

    setContinueText('Saving profile...');
    const response = await Core.UserController.saveProfile(user, image, publicKey);

    if (!response.ok) {
      console.error('Failed to save profile', response);
      return;
    }

    // TODO: save user to store. Not sure about that one. Maybe we populate after bootstrap endpoint?
    // TODO: navigate to profile page
    // setIsSaving(false);
    router.push('/feed');
  };

  return (
    <>
      <Atoms.Card className="bg-card rounded-md p-6 md:p-12 lg:flex lg:gap-12 lg:flex-row">
        {/* Profile Section */}
        <Atoms.Container className="gap-6 w-full">
          <Atoms.Container className="gap-3">
            <Atoms.Heading level={3} size="xl" className="text-2xl">
              Profile
            </Atoms.Heading>
          </Atoms.Container>

          <Atoms.Container className="gap-6">
            <Atoms.Container className="gap-2">
              <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground">NAME*</Atoms.Label>
              <Molecules.InputField
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
        <Atoms.Container className="gap-6 w-full mt-6 lg:mt-0">
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

            <Molecules.DialogAddLink
              onSave={(label, url) => {
                setLinks([...links, { label, url }]);
              }}
            />
          </Atoms.Container>
        </Atoms.Container>

        {/* Avatar Section */}
        <Atoms.Container className="gap-6 w-full mt-6 lg:mt-0">
          <Atoms.Container className="gap-3 md:text-center">
            <Atoms.Heading level={3} size="xl" className="text-2xl">
              Avatar
            </Atoms.Heading>
          </Atoms.Container>

          <Atoms.Container className="justify-center flex-row">
            <Atoms.Avatar
              key={avatarPreview ? 'with-image' : 'without-image'}
              className="h-48 w-48 bg-muted cursor-pointer"
              onClick={handleChooseFileClick}
              role="button"
              aria-label="Choose avatar image"
            >
              {avatarPreview ? (
                <Atoms.AvatarImage
                  src={avatarPreview}
                  alt={avatarFile ? `Selected avatar preview: ${avatarFile.name}` : 'Selected avatar preview'}
                />
              ) : (
                <Atoms.AvatarFallback className="text-4xl">SN</Atoms.AvatarFallback>
              )}
            </Atoms.Avatar>
          </Atoms.Container>

          <Atoms.Container className="justify-center">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Atoms.Button
              variant="secondary"
              size="sm"
              className="rounded-full mx-auto"
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
      <Molecules.ProfileNavigation
        backButtonDisabled={true}
        continueButtonDisabled={
          !!nameError ||
          name.trim().length < 3 ||
          Object.values(linkUrlErrors).some((m) => !!m) ||
          !!avatarError ||
          isSaving
        }
        continueButtonLoading={isSaving}
        continueText={continueText}
        onContinue={handleContinue}
      />
    </>
  );
};
