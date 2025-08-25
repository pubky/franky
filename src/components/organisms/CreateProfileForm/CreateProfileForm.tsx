'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, File as FileIcon } from 'lucide-react';
import { z } from 'zod';
import { PubkyAppUser } from 'pubky-app-specs';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

export const CreateProfileForm = () => {
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
  const profileSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    bio: z.string().trim().optional(),
    links: z
      .array(
        z.object({
          label: z.string().min(1, 'Label is required'),
          url: z.string().trim().url('Invalid URL'),
        }),
      )
      .optional(),
    avatar: z
      .union([z.instanceof(File), z.null()])
      .refine((file) => file == null || file.type.startsWith('image/'), {
        message: 'Avatar must be an image file',
      })
      .optional(),
  });

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

  const validateProfile = async () => {
    const nonEmptyLinks = validateLinks(links);
    const result = profileSchema.safeParse({
      name,
      bio,
      links: nonEmptyLinks.length > 0 ? nonEmptyLinks : undefined,
      avatar: avatarFile,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const path0 = issue.path[0];
        if (path0 === 'name') setNameError(issue.message);
        if (path0 === 'links') {
          const index = typeof issue.path[1] === 'number' ? (issue.path[1] as number) : undefined;
          const field = issue.path[2];
          if (typeof index === 'number' && field === 'url') {
            setLinkUrlErrors((prev) => ({ ...prev, [index]: issue.message }));
          }
        }
        if (path0 === 'avatar') setAvatarError(issue.message);
      }
      return;
    }

    return result.data;
  };

  const validateLinks = (links: { label: string; url: string }[]) => {
    return links.map((l) => ({ ...l, url: l.url.trim() })).filter((l) => l.url.length > 0);
  };

  // TODO: extract to controller (AuthController?)
  const uploadAvatar = async (homeserver: Core.HomeserverService) => {
    if (!avatarFile) return null;

    // 1. Upload Blob
    const fileContent = await avatarFile.arrayBuffer();
    const blobData = new Uint8Array(fileContent);
    const blobResult = await Core.PubkySpecsPipes.normalizeBlob(blobData, publicKey);

    // Push blob to homeserver
    await homeserver.fetch(blobResult.meta.url, {
      method: 'PUT',
      body: blobResult.blob.data,
    });

    // 2. Create File Record
    const fileResult = await Core.PubkySpecsPipes.normalizeFile(avatarFile, blobResult.meta.url, publicKey);

    // Push file to homeserver
    await homeserver.fetch(fileResult.meta.url, {
      method: 'PUT',
      body: JSON.stringify(fileResult.file.toJson()),
    });
    return fileResult.meta.url;
  };

  // TODO: extract to controller (AuthController?)
  const saveProfile = async (
    homeserver: Core.HomeserverService,
    profile: z.infer<typeof profileSchema>,
    image: string | null,
  ) => {
    // validate user profile specs
    const user = await Core.PubkySpecsPipes.normalizeUser(
      {
        name: profile.name,
        bio: profile.bio ?? '',
        image: image ?? '',
        links: (profile.links ?? []).map((link) => ({ title: link.label, url: link.url })),
        status: '', // default is blank
      },
      publicKey,
    );
    const userJson = user.user.toJson() as PubkyAppUser;

    // save user profile
    Core.useProfileStore.getState().setCurrentUserPubky(publicKey);

    const response = await homeserver.fetch(user.meta.url, {
      method: 'PUT',
      body: JSON.stringify(userJson),
    });
    return response;
  };

  const handleContinue = async () => {
    setIsSaving(true);
    setContinueText('Saving...');
    const profile = await validateProfile();

    if (!profile) return;

    const homeserver = Core.HomeserverService.getInstance();
    let image: string | null = null;
    if (avatarFile) {
      setContinueText('Uploading avatar...');
      image = await uploadAvatar(homeserver);
      if (!image) return;
    }

    setContinueText('Saving profile...');
    const response = await saveProfile(homeserver, profile, image);

    if (!response.ok) {
      console.error('Failed to save profile', response);
      return;
    }

    // TODO: save user to store
    // TODO: navigate to profile page
    setIsSaving(false);
    setContinueText('Finish');
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
                  icon={<Trash2 className="h-4 w-4" />}
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
              onClick={handleChooseFileClick}
            >
              <FileIcon className="h-4 w-4" />
              <span>Choose file</span>
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
