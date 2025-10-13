'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app';

export interface ProfileHeaderProps {
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  status?: string;
  isOwnProfile?: boolean;
  className?: string;
}

export function ProfileHeader({
  name,
  handle,
  bio,
  avatar,
  status = 'Vacationing',
  isOwnProfile = true,
  className,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  const handleCopyPubky = async () => {
    try {
      await navigator.clipboard.writeText(handle);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${handle}`);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSignOut = () => {
    router.push(APP_ROUTES.HOME);
  };

  const handleEditProfile = () => {
    router.push(APP_ROUTES.SETTINGS);
  };

  return (
    <div className={Libs.cn('flex flex-col lg:flex-row gap-6 lg:gap-8 w-full', className)}>
      {/* Avatar */}
      <div className="flex justify-center lg:justify-start">
        <Atoms.Avatar className="w-16 h-16 lg:w-[136px] lg:h-[136px]">
          <Atoms.AvatarImage src={avatar} alt={name} />
          <Atoms.AvatarFallback className="text-2xl lg:text-5xl">
            {Libs.extractInitials({ name, maxLength: 2 })}
          </Atoms.AvatarFallback>
        </Atoms.Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 lg:gap-6">
        {/* Name and Bio */}
        <div className="text-center lg:text-left flex flex-col gap-3">
          <Atoms.Heading level={1} className="text-2xl lg:text-4xl font-normal">
            {name}
          </Atoms.Heading>
          {bio && (
            <Atoms.Typography size="md" className="text-muted-foreground font-normal">
              {bio}
            </Atoms.Typography>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 items-center lg:items-start">
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {isOwnProfile && (
              <>
                <Atoms.Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditProfile}
                  className="h-8 px-3 py-2"
                >
                  <Libs.Pencil className="w-4 h-4 mr-2" />
                  Edit profile
                </Atoms.Button>
              </>
            )}

            <Atoms.Button
              variant="secondary"
              size="sm"
              onClick={handleCopyPubky}
              className="h-8 px-3 py-2 uppercase font-mono"
            >
              <Libs.Key className="w-4 h-4 mr-2" />
              {handle.length > 10 ? `${handle.slice(0, 4)}...${handle.slice(-4)}` : handle}
            </Atoms.Button>

            <Atoms.Button variant="secondary" size="sm" onClick={handleCopyLink} className="h-8 px-3 py-2">
              <Libs.Link className="w-4 h-4 mr-2" />
              Link
            </Atoms.Button>

            {isOwnProfile && (
              <Atoms.Button variant="secondary" size="sm" onClick={handleSignOut} className="h-8 px-3 py-2">
                <Libs.LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Atoms.Button>
            )}
          </div>

          {/* Status Dropdown */}
          {isOwnProfile && (
            <div className="relative">
              <Atoms.Popover open={showStatusMenu} onOpenChange={setShowStatusMenu}>
                <Atoms.PopoverTrigger asChild>
                  <Atoms.Button variant="secondary" size="sm" className="h-8 px-3 py-2">
                    <span className="mr-2">🌴</span>
                    {status}
                    <Libs.ChevronDown className="w-4 h-4 ml-2" />
                  </Atoms.Button>
                </Atoms.PopoverTrigger>
                <Atoms.PopoverContent align="start" className="w-56">
                  <div className="flex flex-col gap-1">
                    <Atoms.Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setShowStatusMenu(false)}
                    >
                      <span className="mr-2">🌴</span>
                      Vacationing
                    </Atoms.Button>
                    <Atoms.Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setShowStatusMenu(false)}
                    >
                      <span className="mr-2">💼</span>
                      Working
                    </Atoms.Button>
                    <Atoms.Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setShowStatusMenu(false)}
                    >
                      <span className="mr-2">🎮</span>
                      Gaming
                    </Atoms.Button>
                    <Atoms.Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setShowStatusMenu(false)}
                    >
                      <span className="mr-2">😴</span>
                      Sleeping
                    </Atoms.Button>
                  </div>
                </Atoms.PopoverContent>
              </Atoms.Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

