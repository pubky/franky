'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/app';
import {
  StatusDropdown,
  EmojiPickerModal,
  useStatusManager,
  useCopyActions,
  useEmojiPicker,
  DEFAULT_STATUS,
} from '@/organisms';

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
  status = DEFAULT_STATUS,
  isOwnProfile = true,
  className,
}: ProfileHeaderProps) {
  const router = useRouter();

  // Custom hooks for state management
  const emojiPicker = useEmojiPicker();
  const statusManager = useStatusManager({
    initialStatus: status,
    showEmojiPicker: emojiPicker.showEmojiPicker,
  });
  const { handleCopyPubky, handleCopyLink } = useCopyActions({ handle });

  // Track which emoji picker is open
  const [isCustomStatusEmojiPicker, setIsCustomStatusEmojiPicker] = React.useState(false);

  // Navigation handlers
  const handleSignOut = () => router.push(APP_ROUTES.HOME);
  const handleEditProfile = () => router.push(APP_ROUTES.EDIT_PROFILE);

  // Emoji selection handler
  const handleEmojiSelect = (emojiObject: {
    native: string;
    shortcodes?: string;
    unified?: string;
    keywords?: string[];
    name?: string;
  }) => {
    if (isCustomStatusEmojiPicker) {
      statusManager.setSelectedEmoji(emojiObject.native);
    } else {
      statusManager.handleEmojiSelect(emojiObject);
    }
    setIsCustomStatusEmojiPicker(false);
  };

  // Custom status emoji picker click handler
  const handleCustomStatusEmojiClick = (e: React.MouseEvent) => {
    setIsCustomStatusEmojiPicker(true);
    emojiPicker.handleEmojiPickerClick(e);
  };

  return (
    <div
      className={Libs.cn(
        'flex flex-col lg:flex-row gap-6 w-full',
        'mt-40 lg:mt-0',
        'bg-card lg:bg-transparent',
        'text-card-foreground lg:text-foreground',
        'rounded-xl lg:rounded-none',
        'shadow-sm lg:shadow-none',
        'p-6 lg:p-0',
        className,
      )}
    >
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
        <div className="flex flex-col gap-3 text-center lg:text-left">
          <Atoms.Heading
            level={1}
            className="text-2xl lg:text-[60px] font-bold leading-none text-white lg:text-white text-center lg:text-left"
          >
            {name}
          </Atoms.Heading>
          {bio && (
            <Atoms.Typography
              size="sm"
              className="text-sm font-medium leading-5 text-muted-foreground text-center lg:text-base lg:font-medium lg:leading-6 lg:text-left"
            >
              {bio}
            </Atoms.Typography>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-center lg:items-start">
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {isOwnProfile && (
              <Atoms.Button
                variant="secondary"
                size="sm"
                onClick={handleEditProfile}
                className="h-8 px-3 py-2 text-xs font-bold"
              >
                <Libs.Pencil className="w-4 h-4 mr-2" />
                Edit profile
              </Atoms.Button>
            )}

            <Atoms.Button
              variant="secondary"
              size="sm"
              onClick={handleCopyPubky}
              className="h-8 px-3 py-2 text-xs font-bold font-mono uppercase"
            >
              <Libs.Key className="w-4 h-4 mr-2" />
              {handle.length > 10 ? `${handle.slice(0, 4)}...${handle.slice(-4)}` : handle}
            </Atoms.Button>

            <Atoms.Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-3 py-2 text-xs font-bold"
            >
              <Libs.Link className="w-4 h-4 mr-2" />
              Link
            </Atoms.Button>

            {isOwnProfile && (
              <Atoms.Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                className="h-8 px-3 py-2 text-xs font-bold"
              >
                <Libs.LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Atoms.Button>
            )}
          </div>

          {/* Status Dropdown */}
          {isOwnProfile && (
            <StatusDropdown
              currentStatus={statusManager.currentStatus}
              customStatus={statusManager.customStatus}
              selectedEmoji={statusManager.selectedEmoji}
              showStatusMenu={statusManager.showStatusMenu}
              onStatusMenuChange={statusManager.handleStatusMenuChange}
              onStatusSelect={statusManager.handleStatusSelect}
              onCustomStatusChange={statusManager.setCustomStatus}
              onCustomStatusSave={statusManager.handleCustomStatusSave}
              onEmojiPickerClick={handleCustomStatusEmojiClick}
            />
          )}
        </div>
      </div>

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        show={emojiPicker.showEmojiPicker}
        customStatus={statusManager.customStatus}
        emojiPickerRef={emojiPicker.emojiPickerRef}
        onEmojiSelect={handleEmojiSelect}
        onClose={emojiPicker.closeEmojiPicker}
        onContentClick={emojiPicker.handleEmojiPickerContentClick}
      />
    </div>
  );
}
