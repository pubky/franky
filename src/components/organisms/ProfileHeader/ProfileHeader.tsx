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
  const [currentStatus, setCurrentStatus] = React.useState(status);
  const [customStatus, setCustomStatus] = React.useState('');
  const [selectedEmoji, setSelectedEmoji] = React.useState('😊');

  const statusOptions = [
    { emoji: '👋', label: 'Available' },
    { emoji: '🕓', label: 'Away' },
    { emoji: '🌴', label: 'Vacationing' },
    { emoji: '👨‍💻', label: 'Working' },
    { emoji: '✈️', label: 'Traveling' },
    { emoji: '🥂', label: 'Celebrating' },
    { emoji: '🤒', label: 'Sick' },
    { emoji: '💭', label: 'No Status' },
  ];

  const commonEmojis = ['😊', '🎉', '💪', '🔥', '❤️', '👍', '✨', '🚀'];

  const cycleEmoji = () => {
    const currentIndex = commonEmojis.indexOf(selectedEmoji);
    const nextIndex = (currentIndex + 1) % commonEmojis.length;
    setSelectedEmoji(commonEmojis[nextIndex]);
  };

  const getCurrentEmoji = () => {
    const option = statusOptions.find((opt) => opt.label === currentStatus);
    return option?.emoji || '🌴';
  };

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
    router.push(APP_ROUTES.EDIT_PROFILE);
  };

  return (
    <div className={Libs.cn('flex flex-col lg:flex-row gap-6 w-full', className)}>
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
          <Atoms.Heading level={1} className="text-2xl lg:text-[60px] lg:leading-[100%] font-bold text-white">
            {name}
          </Atoms.Heading>
          {bio && (
            <Atoms.Typography size="md" className="text-base leading-normal font-medium text-[#D4D4DB]">
              {bio}
            </Atoms.Typography>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 items-center lg:items-start">
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {isOwnProfile && (
              <>
                <Atoms.Button variant="secondary" size="sm" onClick={handleEditProfile} className="h-8 px-3 py-2">
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
                  <div className="flex items-center cursor-pointer text-xl font-light leading-7 tracking-wide">
                    <span className="mr-2">{getCurrentEmoji()}</span>
                    <span>{currentStatus}</span>
                    <Libs.ChevronDown
                      className={Libs.cn(
                        'w-4 h-4 ml-1 transition-transform duration-300',
                        showStatusMenu ? 'rotate-180' : 'rotate-0',
                      )}
                    />
                  </div>
                </Atoms.PopoverTrigger>
                <Atoms.PopoverContent align="start" className="w-72 p-2">
                  <div className="flex flex-col gap-1">
                    {statusOptions.map((option) => (
                      <Atoms.Button
                        key={option.label}
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={() => {
                          setCurrentStatus(option.label);
                          setShowStatusMenu(false);
                          // TODO: Save status to backend
                        }}
                      >
                        <span className="mr-2">{option.emoji}</span>
                        {option.label}
                      </Atoms.Button>
                    ))}

                    {/* Custom Status Section */}
                    <div className="mt-3 pt-3 border-t">
                      <Atoms.Label className="text-[11px] text-muted-foreground mb-2">CUSTOM STATUS</Atoms.Label>
                      <div className="flex gap-2">
                        <Atoms.Input
                          value={customStatus}
                          onChange={(e) => setCustomStatus(e.target.value)}
                          placeholder="Add status"
                          maxLength={12}
                          className="flex-1 h-8 text-sm"
                        />
                        <Atoms.Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={cycleEmoji}
                          title="Click to change emoji"
                        >
                          {selectedEmoji}
                        </Atoms.Button>
                        {customStatus && (
                          <Atoms.Button
                            variant="ghost"
                            size="sm"
                            className="px-2"
                            onClick={() => {
                              setCurrentStatus(customStatus);
                              setShowStatusMenu(false);
                              // TODO: Save custom status to backend
                            }}
                          >
                            <Libs.Plus className="w-4 h-4" />
                          </Atoms.Button>
                        )}
                      </div>
                    </div>
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
