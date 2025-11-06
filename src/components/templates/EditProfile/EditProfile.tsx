'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app';

export function EditProfile() {
  const router = useRouter();
  const [name, setName] = React.useState('Satoshi Nakamoto');
  const [bio, setBio] = React.useState('Authored the Bitcoin white paper, developed Bitcoin, mined 1st block.');
  const [links, setLinks] = React.useState([
    { title: 'WEBSITE', url: 'https://www.bitcoin.org/', placeholder: 'https://' },
    { title: 'X (TWITTER)', url: '@satoshi', placeholder: '@user' },
  ]);
  const [avatar, setAvatar] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);

  const handleAddLink = () => {
    setLinks([...links, { title: 'NEW LINK', url: '', placeholder: 'https://' }]);
  };

  const handleUpdateLink = (index: number, url: string) => {
    const newLinks = [...links];
    newLinks[index].url = url;
    setLinks(newLinks);
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    router.push(APP_ROUTES.PROFILE);
  };

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement save logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    router.push(APP_ROUTES.PROFILE);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatar(undefined);
  };

  return (
    <div className="max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl w-full m-auto px-6 xl:px-0 py-12">
      {/* Header */}
      <div className="mb-6">
        <Atoms.Heading level={1} className="text-2xl lg:text-[60px] lg:leading-[100%] font-bold text-white mb-2">
          Edit your <span className="text-brand">profile.</span>
        </Atoms.Heading>
        <div className="flex items-center gap-3">
          <Atoms.Typography size="lg" className="text-base leading-normal font-medium text-muted-foreground">
            Add your name, bio, links, and avatar.
          </Atoms.Typography>
          <Atoms.Badge variant="secondary" className="px-3 py-1 gap-2">
            <Libs.Key size={14} />
            kls37...xri8o
          </Atoms.Badge>
          <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <Libs.HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <Atoms.Card className="p-8 lg:p-12 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Profile Section */}
          <div className="flex flex-col gap-6">
            <Atoms.Heading level={2} size="xl" className="font-bold">
              Profile
            </Atoms.Heading>

            <div>
              <Atoms.Label className="text-[11px] text-muted-foreground mb-2">NAME</Atoms.Label>
              <Molecules.InputField
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                maxLength={24}
              />
            </div>

            <div>
              <Atoms.Label className="text-[11px] text-muted-foreground mb-2">BIO</Atoms.Label>
              <Molecules.TextareaField
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                disabled={loading}
                maxLength={160}
                rows={4}
              />
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-col gap-6">
            <Atoms.Heading level={2} size="xl" className="font-bold">
              Links
            </Atoms.Heading>

            {links.map((link, index) => (
              <div key={index} className="relative">
                <Atoms.Label className="text-[11px] text-muted-foreground mb-2">{link.title}</Atoms.Label>
                <Molecules.InputField
                  value={link.url}
                  onChange={(e) => handleUpdateLink(index, e.target.value)}
                  placeholder={link.placeholder}
                  disabled={loading}
                />
                {index >= 2 && (
                  <button
                    onClick={() => handleDeleteLink(index)}
                    className="absolute right-3 top-9 p-1 rounded hover:bg-muted transition-colors"
                  >
                    <Libs.Trash2 size={16} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={handleAddLink}
              className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              <Libs.Link size={16} />
              Add link
            </button>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col gap-6 items-center">
            <Atoms.Heading level={2} size="xl" className="font-bold">
              Avatar
            </Atoms.Heading>

            <div className="relative">
              <Atoms.Avatar className="w-40 h-40">
                <Atoms.AvatarImage src={avatar} alt={name} />
                <Atoms.AvatarFallback className="text-4xl">
                  {Libs.extractInitials({ name, maxLength: 2 })}
                </Atoms.AvatarFallback>
              </Atoms.Avatar>

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
                disabled={loading}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
              >
                <Libs.Plus size={24} />
              </label>
            </div>

            {avatar && (
              <Atoms.Button variant="ghost" size="sm" onClick={handleDeleteAvatar} disabled={loading} className="gap-2">
                <Libs.Trash2 size={16} />
                Delete
              </Atoms.Button>
            )}
          </div>
        </div>
      </Atoms.Card>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full justify-between">
        <Atoms.Button variant="secondary" size="lg" onClick={handleCancel} disabled={loading} className="px-8">
          Cancel
        </Atoms.Button>
        <Atoms.Button variant="secondary" size="lg" onClick={handleSave} disabled={loading} className="px-8">
          {loading ? 'Saving...' : 'Save Profile'}
        </Atoms.Button>
      </div>
    </div>
  );
}
