'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { CopyButton } from '@/components/ui/copy-button';
import { InfoCard } from '@/components/ui/info-card';
import { useKeypairStore } from '@/core/stores';
import { Trash2, Plus, Link as LinkIcon, Upload, User, Camera, ArrowRight, Info } from 'lucide-react';
import { PubkySpecsPipes } from '@/core/pipes';
import { HomeserverService } from '@/core/services/homeserver';

// Zod validation schemas
const linkSchema = z.object({
  title: z.string().min(1, 'Link title is required').max(50, 'Link title must be 50 characters or less'),
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
});

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  links: z.array(linkSchema).optional(),
  image: z.string().optional(),
});

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export default function ProfilePage() {
  const { publicKey, generateKeys, hasGenerated } = useKeypairStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate keys if they don't exist
  useEffect(() => {
    if (!publicKey && !hasGenerated) {
      generateKeys();
    }
  }, [publicKey, hasGenerated, generateKeys]);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  const [links, setLinks] = useState<LinkItem[]>([]);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Validation error states
  const [linkErrors, setLinkErrors] = useState<Record<string, { title?: string; url?: string }>>({});
  const [formErrors, setFormErrors] = useState<{ name?: string; bio?: string }>({});

  // Validation functions
  const validateFormField = (field: keyof typeof formData, value: string) => {
    const fieldSchema = profileSchema.shape[field];
    if (!fieldSchema) return;

    try {
      fieldSchema.parse(value);
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  };

  const validateLink = (id: string, field: 'title' | 'url', value: string) => {
    const fieldSchema = linkSchema.shape[field];

    try {
      fieldSchema.parse(value);
      setLinkErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined },
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLinkErrors((prev) => ({
          ...prev,
          [id]: { ...prev[id], [field]: error.errors[0]?.message },
        }));
      }
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateFormField(field, value);
  };

  const handleLinkChange = (id: string, field: 'title' | 'url', value: string) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
    validateLink(id, field, value);
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: '',
      url: '',
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setLinkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleAvatarUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Filter out completely blank links (both title and URL empty)
      // and validate that remaining links have both title and URL
      const validLinks = links.filter((link) => {
        const hasTitle = link.title.trim() !== '';
        const hasUrl = link.url.trim() !== '';

        // Keep links that have both title and URL
        // Skip completely blank links (both empty)
        if (!hasTitle && !hasUrl) {
          return false;
        }

        // If link has either title or URL, it must have both
        return hasTitle && hasUrl;
      });

      // Validate the entire profile data
      const profileData = {
        name: formData.name,
        bio: formData.bio || undefined,
        image: undefined,
        links: validLinks.map((link) => ({
          title: link.title,
          url: link.url,
        })),
      };

      // Validate with Zod
      const validatedData = profileSchema.parse(profileData);

      // Create keypair object from store using HomeserverService
      const homeserverService = HomeserverService.getInstance();
      const resultCreateUser = await PubkySpecsPipes.normalizeUser(
        {
          name: validatedData.name,
          bio: validatedData.bio || '',
          links: validatedData.links || [],
          image: validatedData.image || '',
          status: '',
        },
        publicKey,
      );
      // Let's bring the full wasm object into JS and assign correct type.
      const user = resultCreateUser.user.toJson();

      // Send the profile to the homeserver
      const response = await homeserverService.fetch(resultCreateUser.meta.url, {
        method: 'PUT',
        body: JSON.stringify(user),
      });

      console.log('Response:', response, user);

      // For now, just navigate to the main app
      //   router.push('/');
    } catch (error) {
      console.error('Profile validation/creation failed:', error);
      if (error instanceof z.ZodError) {
        // Handle validation errors
        error.errors.forEach((err) => {
          console.error('Validation error:', err.path, err.message);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    // Check basic form validation
    const basicFormValid =
      formData.name.trim() !== '' &&
      !formErrors.name &&
      !formErrors.bio &&
      Object.values(linkErrors).every((error) => !error.title && !error.url);

    // Check that all links are either completely empty (both title and URL) or completely filled
    const linksValid = links.every((link) => {
      const hasTitle = link.title.trim() !== '';
      const hasUrl = link.url.trim() !== '';

      // Valid if both empty (will be filtered out) or both filled
      return (!hasTitle && !hasUrl) || (hasTitle && hasUrl);
    });

    return basicFormValid && linksValid;
  }, [formData.name, formErrors.name, formErrors.bio, linkErrors, links]);

  // Memoized computed values for performance
  const nameFieldClassName = useMemo(
    () =>
      `text-lg font-medium rounded-xl border-2 bg-background text-foreground p-4 h-14 transition-all focus:outline-none focus:ring-2 ${
        formErrors.name
          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          : 'focus:ring-green-500/20 focus:border-green-500/30'
      }`,
    [formErrors.name],
  );

  const bioFieldClassName = useMemo(
    () =>
      `w-full text-base rounded-xl border-2 bg-background text-foreground p-4 transition-all focus:outline-none focus:ring-2 resize-none ${
        formErrors.bio
          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          : 'border-muted focus:ring-green-500/20 focus:border-green-500/30'
      }`,
    [formErrors.bio],
  );

  const continueButtonClassName = useMemo(
    () =>
      `rounded-full w-full text-white sm:w-auto bg-green-500 hover:bg-green-600 disabled:opacity-50 transition-all duration-200 ${
        !isFormValid || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
      }`,
    [isFormValid, isSubmitting],
  );

  const dragActiveClassName = useMemo(
    () =>
      `w-32 h-32 rounded-full border-4 border-dashed transition-all duration-300 flex items-center justify-center cursor-pointer ${
        dragActive
          ? 'border-green-500 bg-green-500/10 scale-105'
          : 'border-muted-foreground/25 bg-muted/50 hover:border-green-500/50 hover:bg-green-500/5'
      }`,
    [dragActive],
  );

  const uploadIconClassName = useMemo(
    () =>
      `h-8 w-8 mx-auto mb-2 transition-all duration-300 ${
        dragActive ? 'text-green-500 animate-bounce' : 'text-muted-foreground'
      }`,
    [dragActive],
  );

  // Memoized function to get link field class names
  const getLinkTitleClassName = useMemo(
    () => (linkId: string) =>
      `rounded-xl border-2 bg-background text-foreground p-4 h-12 transition-all focus:outline-none focus:ring-2 ${
        linkErrors[linkId]?.title
          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          : 'border-muted focus:ring-green-500/20 focus:border-green-500/30'
      }`,
    [linkErrors],
  );

  const getLinkUrlClassName = useMemo(
    () => (linkId: string) =>
      `rounded-xl border-2 bg-background text-foreground p-4 h-12 transition-all focus:outline-none focus:ring-2 ${
        linkErrors[linkId]?.url
          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
          : 'border-muted focus:ring-green-500/20 focus:border-green-500/30'
      }`,
    [linkErrors],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <>
            Build your <span className="text-green-500">profile</span>.
          </>
        }
        subtitle="Add your name, bio, some links, and upload a user picture"
        titleClassName="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-none text-foreground"
        subtitleClassName=""
      />

      {/* Your Identity - Matches Profile Information design */}
      <Card className="h-full">
        <div className="px-6 py-4 sm:px-8 sm:py-5">
          {/* Header with Icon - Same as Profile Information */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <User className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Your Decentralized Identity</h3>
              <p className="text-muted-foreground">This unique PUBKY identifier represents you across the network</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* PUBKY Field - Same structure as other fields */}
            <div className="space-y-4">
              {!publicKey && !hasGenerated ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Identity Generation Required</p>
                    <p className="text-xs text-amber-700">Complete the onboarding flow to generate your keys</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!publicKey && !hasGenerated ? (
                    <div className="w-full font-mono text-sm bg-background border-2 border-muted rounded-xl p-4 break-all leading-relaxed">
                      <span className="text-green-600 animate-pulse">Generating your unique identity...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full font-mono text-sm bg-background border-2 border-muted rounded-xl p-4">
                      <code className="flex-1 break-all leading-relaxed text-foreground min-w-0">{publicKey}</code>
                      <CopyButton
                        text={publicKey}
                        variant="outline"
                        size="sm"
                        className="shrink-0 w-full sm:w-auto h-8 px-3 text-xs border-muted hover:border-green-500/30 hover:bg-green-500/5 text-muted-foreground hover:text-foreground transition-all duration-200"
                        normalText="Copy"
                        copiedText="Copied!"
                      />
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                This is your permanent identity on the decentralized network. Keep it safe and share it with others to
                connect.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="px-6 py-4 sm:px-8 sm:py-5">
              {/* Header with Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <User className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Profile Information</h3>
                  <p className="text-muted-foreground">Tell the world about yourself</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Name Field - Required */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">DISPLAY NAME *</label>
                    <span className="text-xs text-green-600">Required</span>
                  </div>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your display name"
                    className={nameFieldClassName}
                    required
                  />
                  {formErrors.name && <p className="text-sm text-red-400 mt-1">{formErrors.name}</p>}
                  <p className="text-sm text-muted-foreground">This is how others will see you on the platform.</p>
                </div>

                {/* Bio Field - Optional */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">BIO</label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell the world about yourself..."
                      rows={4}
                      maxLength={160}
                      className={bioFieldClassName}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {formData.bio.length}/160
                    </div>
                  </div>
                  {formErrors.bio && <p className="text-sm text-red-400 mt-1">{formErrors.bio}</p>}
                </div>

                {/* Links Section - Optional */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">LINKS</label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>

                  <div className="space-y-4">
                    {links.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-muted/20 rounded-xl border border-muted/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-muted/30 rounded-full">
                            <LinkIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">No links added</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Add links to your projects, portfolio, or other content
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      links.map((link) => {
                        const hasTitle = link.title.trim() !== '';
                        const hasUrl = link.url.trim() !== '';
                        const isIncomplete = (hasTitle && !hasUrl) || (!hasTitle && hasUrl);

                        return (
                          <div key={link.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <LinkIcon className="h-4 w-4" />
                              Link Title
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="text"
                                value={link.title}
                                onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                                placeholder="Enter link title (e.g., GitHub, Portfolio, Blog)"
                                className={getLinkTitleClassName(link.id)}
                              />
                              {linkErrors[link.id]?.title && (
                                <p className="text-sm text-red-400 mt-1">{linkErrors[link.id].title}</p>
                              )}
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                    placeholder="https://example.com"
                                    className={getLinkUrlClassName(link.id)}
                                  />
                                  {linkErrors[link.id]?.url && (
                                    <p className="text-sm text-red-400 mt-1">{linkErrors[link.id].url}</p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeLink(link.id)}
                                  className="shrink-0 h-12 px-3 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-200 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {isIncomplete && (
                                <p className="text-sm text-amber-600 mt-2">
                                  Please provide both title and URL, or remove this link.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLink}
                      className="w-full justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-muted hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-200 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      {links.length === 0 ? 'Add a link' : 'Add another link'}
                    </Button>

                    {/* Show summary of incomplete links */}
                    {links.length > 0 &&
                      (() => {
                        const incompleteLinks = links.filter((link) => {
                          const hasTitle = link.title.trim() !== '';
                          const hasUrl = link.url.trim() !== '';
                          return (hasTitle && !hasUrl) || (!hasTitle && hasUrl);
                        });

                        if (incompleteLinks.length > 0) {
                          return (
                            <p className="text-sm text-amber-600 text-center py-2">
                              {incompleteLinks.length} incomplete link{incompleteLinks.length > 1 ? 's' : ''} - please
                              complete or remove
                            </p>
                          );
                        }
                        return null;
                      })()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Avatar Section - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="px-6 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-3 py-1 mb-3">
                    <Camera className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">Avatar</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">Upload your avatar (optional)</p>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative group">
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          width={128}
                          height={128}
                          className="w-32 h-32 rounded-full object-cover border-4 border-green-500/20 group-hover:border-green-500/40 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-xs font-medium">Click to change</div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={dragActiveClassName}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Upload className={uploadIconClassName} />
                          <p className="text-xs text-muted-foreground">{dragActive ? 'Drop here!' : 'Click or drag'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-12 rounded-xl hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-200 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {avatar ? 'Change Avatar' : 'Upload Avatar'}
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {avatar && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={removeAvatar}
                        className="w-full h-12 rounded-xl text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Avatar
                      </Button>
                    )}
                  </div>

                  {/* Avatar Tips */}
                  <div className="border-t pt-4 w-full">
                    <InfoCard title="Tips for best results" icon={Info} variant="info">
                      <ul className="space-y-1">
                        <li>• Use a square image (1:1 ratio)</li>
                        <li>• Minimum 400x400 pixels</li>
                        <li>• JPG, PNG, or WebP format</li>
                      </ul>
                    </InfoCard>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-end mt-2">
        <Button
          size="lg"
          className={continueButtonClassName}
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating Profile...
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Continue to App</span>
              <span className="sm:hidden">Continue</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
