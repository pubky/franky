'use client';

import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as App from '@/app';

export interface SettingsInfoProps {
  className?: string;
}

const FAQ_QUESTIONS = [
  { question: 'How can I update my profile information?', href: App.SETTINGS_ROUTES.HELP },
  { question: 'How can I delete my post?', href: App.SETTINGS_ROUTES.HELP },
  { question: 'How do I mute someone?', href: App.SETTINGS_ROUTES.HELP },
  { question: 'How can I restore my account?', href: App.SETTINGS_ROUTES.HELP },
  { question: 'How is Pubky different from other social platforms?', href: App.SETTINGS_ROUTES.HELP },
];

const APP_VERSION = 'Pubky v0.12 © Synonym Software Ltd';

export function SettingsInfo({ className }: SettingsInfoProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Terms of Service & Privacy Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Terms of Service & Privacy" subtitle="Please read our terms carefully." />
        <Atoms.FilterList>
          <Organisms.DialogTerms
            trigger={<Atoms.SidebarButton icon={Libs.FileText}>Terms of service</Atoms.SidebarButton>}
          />
          <Organisms.DialogPrivacy
            trigger={<Atoms.SidebarButton icon={Libs.LockKeyhole}>Privacy policy</Atoms.SidebarButton>}
          />
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* FAQ Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="FAQ" />
        <Atoms.FilterList>
          {FAQ_QUESTIONS.map((faq, index) => (
            <Link key={index} href={faq.href}>
              <div className="relative cursor-pointer rounded-md border border-border p-4 transition-colors hover:border-white">
                <span className="block pr-6 text-sm leading-normal font-bold text-[var(--base-popover-foreground,#EEEEF6)]">
                  {faq.question}
                </span>
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Libs.ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
          <Link href={App.SETTINGS_ROUTES.HELP}>
            <Atoms.SidebarButton icon={Libs.HelpCircle}>More FAQ</Atoms.SidebarButton>
          </Link>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Version" />
        <Atoms.FilterList className="gap-2">
          <p className="text-base leading-normal font-medium text-[var(--base-secondary-foreground,#D4D4DB)]">
            {APP_VERSION}
          </p>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
