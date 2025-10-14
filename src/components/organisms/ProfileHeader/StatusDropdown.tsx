'use client';

import { MouseEvent } from 'react';
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
  onCustomStatusSave: () => void;
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
  onCustomStatusSave,
  onEmojiPickerClick,
}: StatusDropdownProps) {
  const getCurrentEmoji = () => {
    const option = STATUS_OPTIONS.find((opt) => opt.label === currentStatus);
    return option?.emoji || '🌴';
  };
  return (
    <div className="relative">
      <Atoms.Popover open={showStatusMenu} onOpenChange={onStatusMenuChange}>
        <Atoms.PopoverTrigger asChild>
          <div
            className="flex items-center cursor-pointer text-md font-bold leading-7 tracking-wide"
            data-testid="popover-trigger"
          >
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
            {STATUS_OPTIONS.map((option) => (
              <Atoms.Button
                key={option.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => onStatusSelect(option.label)}
              >
                <span className="mr-2">{option.emoji}</span>
                {option.label}
              </Atoms.Button>
            ))}

            {/* Custom Status Section */}
            <div className="mt-3 pt-3 border-t">
              <Atoms.Label className="text-sm text-muted-foreground mb-2">CUSTOM STATUS</Atoms.Label>
              <div className="flex gap-2">
                <Atoms.Input
                  value={customStatus}
                  onChange={(e) => onCustomStatusChange(e.target.value)}
                  placeholder="Add status"
                  maxLength={MAX_CUSTOM_STATUS_LENGTH}
                  className="flex-1 h-8 text-sm"
                />
                <Atoms.Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  onClick={onEmojiPickerClick}
                  title="Click to change emoji"
                >
                  {selectedEmoji}
                </Atoms.Button>
                {customStatus && (
                  <Atoms.Button variant="ghost" size="sm" className="px-2" onClick={onCustomStatusSave}>
                    <Libs.Plus className="w-4 h-4" />
                  </Atoms.Button>
                )}
              </div>
            </div>
          </div>
        </Atoms.PopoverContent>
      </Atoms.Popover>
    </div>
  );
}
