'use client';

import { MouseEvent, useState, useEffect } from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { STATUS_OPTIONS, MAX_CUSTOM_STATUS_LENGTH } from './index';

interface StatusDropdownProps {
  currentStatus: string;
  customStatus: string;
  selectedEmoji: string;
  showStatusMenu: boolean;
  onStatusMenuChange: (open: boolean) => void;
  onStatusSelect: (status: string) => void;
  onCustomStatusChange: (status: string) => void;
  onEmojiPickerClick: (e: MouseEvent) => void;
}

export function StatusDropdown({
  currentStatus,
  customStatus,
  selectedEmoji,
  showStatusMenu,
  onStatusMenuChange,
  onStatusSelect,
  onCustomStatusChange,
  onEmojiPickerClick,
}: StatusDropdownProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentEmoji = () => {
    const option = STATUS_OPTIONS.find((opt) => opt.label === currentStatus);
    const fallback = option?.emoji || '🌴';
    return selectedEmoji && selectedEmoji.trim() !== '' ? selectedEmoji : fallback;
  };

  return (
    <div className="relative">
      <Atoms.Popover open={showStatusMenu} onOpenChange={onStatusMenuChange}>
        <Atoms.PopoverTrigger asChild>
          <div
            className="flex items-center gap-1 cursor-pointer text-base font-bold leading-6 tracking-wide h-8"
            data-testid="popover-trigger"
          >
            <span>{getCurrentEmoji()}</span>
            <span>{currentStatus}</span>
            <Libs.ChevronDown
              className={Libs.cn(
                'w-6 h-6 transition-transform duration-300',
                showStatusMenu ? 'rotate-180' : 'rotate-0',
              )}
            />
          </div>
        </Atoms.PopoverTrigger>
        <Atoms.PopoverContent align={isMobile ? 'center' : 'start'} className="w-64 p-4">
          <div className="flex flex-col gap-1 lg:gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = option.label === currentStatus;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onStatusSelect(option.label)}
                  className={Libs.cn(
                    'flex items-center gap-2 rounded-sm p-0 cursor-pointer w-full text-left',
                    'hover:bg-accent/50 transition-colors',
                  )}
                >
                  <span
                    className={Libs.cn(
                      'shrink-0 size-4 flex items-center justify-center text-base leading-6',
                      isSelected ? 'text-foreground' : 'text-popover-foreground',
                    )}
                  >
                    {option.emoji}
                  </span>
                  <span
                    className={Libs.cn(
                      'flex-1 text-base font-medium leading-6 overflow-ellipsis overflow-hidden whitespace-nowrap',
                      isSelected ? 'text-popover-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected && <Libs.Check className="size-5 shrink-0 text-foreground" />}
                </button>
              );
            })}

            {/* Custom Status Section */}
            <div className="flex flex-col gap-2.5 pt-1">
              <p className="text-xs font-medium leading-5 text-muted-foreground tracking-[1.2px] uppercase">
                CUSTOM STATUS
              </p>
              <div className="bg-alpha/90 border border-dashed border-input rounded-md">
                <div className="flex items-center gap-1 px-5 py-4">
                  <span className="shrink-0 size-6 flex items-center justify-center text-base leading-6 text-foreground">
                    {selectedEmoji || '😊'}
                  </span>
                  <Atoms.Input
                    value={customStatus}
                    onChange={(e) => onCustomStatusChange(e.target.value)}
                    placeholder="Add status"
                    maxLength={MAX_CUSTOM_STATUS_LENGTH}
                    className="flex-1 text-base font-medium leading-6 bg-transparent border-0 p-0 h-auto text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Atoms.Button
                    variant="ghost"
                    size="icon"
                    className="size-9 p-1 rounded-full shrink-0"
                    onClick={onEmojiPickerClick}
                    title="Click to change emoji"
                    type="button"
                  >
                    <Libs.Smile className="size-5" strokeWidth={2} />
                  </Atoms.Button>
                </div>
              </div>
            </div>
          </div>
        </Atoms.PopoverContent>
      </Atoms.Popover>
    </div>
  );
}
