'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

const languages = [
  { code: 'english', name: 'English', flag: '🇺🇸' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸', disabled: true },
  { code: 'german', name: 'German', flag: '🇩🇪', disabled: true },
  { code: 'french', name: 'French', flag: '🇫🇷', disabled: true },
  { code: 'italian', name: 'Italian', flag: '🇮🇹', disabled: true },
];

export interface SettingsLanguageProps {
  className?: string;
}

export function SettingsLanguage({ className }: SettingsLanguageProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState('english');
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage) || languages[0];

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.Languages}
      title="Language"
      description="Choose your preferred language for the Pubky interface."
      className={className}
    >
      <div className="w-full p-6 bg-white/5 shadow-[0px_20px_40px_0px_rgba(5,5,10,0.50)] rounded-2xl flex-col justify-start items-start gap-2 inline-flex">
        <p className="text-xs font-bold uppercase text-muted-foreground">Display language</p>

        <div ref={dropdownRef} className="relative w-full">
          {/* Dropdown trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={Libs.cn(
              'flex items-center justify-between w-full px-4 py-2 text-lg font-light leading-7 tracking-wide cursor-pointer',
              'hover:opacity-80 transition-opacity',
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">{selectedLang.flag}</span>
              <span>{selectedLang.name}</span>
            </span>
            <Libs.ChevronDown
              size={20}
              className={Libs.cn('transition-transform duration-300', isOpen && 'rotate-180')}
            />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div
              className={Libs.cn(
                'absolute left-0 right-0 top-full mt-2 z-50',
                'bg-popover border border-border rounded-lg shadow-lg',
                'py-2 animate-in fade-in-0 zoom-in-95 duration-200',
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (!lang.disabled) {
                      setSelectedLanguage(lang.code);
                      setIsOpen(false);
                    }
                  }}
                  disabled={lang.disabled}
                  className={Libs.cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
                    lang.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent cursor-pointer',
                    selectedLanguage === lang.code && 'bg-accent/50',
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-light">{lang.name}</span>
                  {selectedLanguage === lang.code && <Libs.Check size={16} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Molecules.SettingsSectionCard>
  );
}
