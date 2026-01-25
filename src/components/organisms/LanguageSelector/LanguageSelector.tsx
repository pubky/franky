'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import * as Libs from '@/libs';
import * as Core from '@/core';
import { LANGUAGES } from './LanguageSelector.constants';

/**
 * Sets the locale cookie for server-side i18n.
 * Cookie is used by next-intl to determine the locale on the server.
 */
function setLocaleCookie(locale: string) {
  const encodedLocale = encodeURIComponent(locale);
  document.cookie = `locale=${encodedLocale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageSelector() {
  const t = useTranslations('language');
  const router = useRouter();
  // Use server locale as source of truth
  const serverLocale = useLocale();
  const { setLanguage } = Core.useSettingsStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync store with server locale on mount (one-way sync: server -> client)
  React.useEffect(() => {
    setLanguage(serverLocale);
  }, [serverLocale, setLanguage]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Prevent same language click
    if (langCode === serverLocale) {
      setIsOpen(false);
      return;
    }

    // Set cookie and close dropdown
    setLocaleCookie(langCode);
    setLanguage(langCode);
    setIsOpen(false);

    // Refresh server components to pick up new locale
    router.refresh();
  };

  const selectedLang = LANGUAGES.find((lang) => lang.code === serverLocale) || LANGUAGES[0];

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <p className="text-xs font-medium tracking-[1.2px] text-muted-foreground uppercase">{t('displayLanguage')}</p>

      <div ref={dropdownRef} className="relative w-full">
        {/* Dropdown trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={Libs.cn(
            'flex h-8 w-full cursor-pointer items-center justify-between',
            'transition-opacity hover:opacity-80',
          )}
        >
          <span className="flex items-center gap-1">
            <span className="w-4 text-[17px]">{selectedLang.flag}</span>
            <span className="text-base leading-6 font-bold">{selectedLang.name}</span>
          </span>
          <Libs.ChevronDown
            size={24}
            className={Libs.cn('transition-transform duration-300', isOpen && 'rotate-180')}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className={Libs.cn(
              'absolute top-full right-0 left-0 z-50 mt-2',
              'rounded-lg border border-border bg-popover shadow-lg',
              'animate-in py-2 duration-200 fade-in-0 zoom-in-95',
              'max-h-[400px] overflow-y-auto',
            )}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (!lang.disabled) {
                    handleLanguageChange(lang.code);
                  }
                }}
                disabled={lang.disabled}
                className={Libs.cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  lang.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-accent',
                  serverLocale === lang.code && 'bg-accent/50',
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-light">{lang.name}</span>
                {serverLocale === lang.code && <Libs.Check size={16} className="ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
