'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as App from '@/app';

export interface SettingsInfoProps {
  className?: string;
}

const FAQ_QUESTION_KEYS = ['updateProfile', 'deletePost', 'muteSomeone', 'restoreAccount', 'pubkyDifferent'] as const;

export function SettingsInfo({ className }: SettingsInfoProps) {
  const t = useTranslations('settingsInfo');

  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Terms of Service & Privacy Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title={t('termsPrivacy.title')} subtitle={t('termsPrivacy.subtitle')} />
        <Atoms.FilterList>
          <Organisms.DialogTerms
            trigger={<Atoms.SidebarButton icon={Libs.FileText}>{t('termsPrivacy.termsOfService')}</Atoms.SidebarButton>}
          />
          <Organisms.DialogPrivacy
            trigger={
              <Atoms.SidebarButton icon={Libs.LockKeyhole}>{t('termsPrivacy.privacyPolicy')}</Atoms.SidebarButton>
            }
          />
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* FAQ Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title={t('faq.title')} />
        <Atoms.FilterList>
          {FAQ_QUESTION_KEYS.map((key) => (
            <Link key={key} href={App.SETTINGS_ROUTES.HELP}>
              <div className="relative cursor-pointer rounded-md border border-border p-4 transition-colors hover:border-white">
                <span className="block pr-6 text-sm leading-normal font-bold text-[var(--base-popover-foreground,#EEEEF6)]">
                  {t(`faq.questions.${key}`)}
                </span>
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Libs.ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
          <Link href={App.SETTINGS_ROUTES.HELP}>
            <Atoms.SidebarButton icon={Libs.HelpCircle}>{t('faq.moreFaq')}</Atoms.SidebarButton>
          </Link>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title={t('version.title')} />
        <Atoms.FilterList className="gap-2">
          <p className="text-base leading-normal font-medium text-[var(--base-secondary-foreground,#D4D4DB)]">
            {t('version.text')}
          </p>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
