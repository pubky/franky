'use client';

import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { SETTINGS_ROUTES } from '@/app';

export interface SettingsInfoProps {
  className?: string;
}

export function SettingsInfo({ className }: SettingsInfoProps) {
  const faqQuestions = [
    { question: 'How can I update my profile information?', href: SETTINGS_ROUTES.HELP },
    { question: 'How can I delete my post?', href: SETTINGS_ROUTES.HELP },
    { question: 'How do I mute someone?', href: SETTINGS_ROUTES.HELP },
    { question: 'How can I restore my account?', href: SETTINGS_ROUTES.HELP },
    { question: 'How is Pubky different from other social platforms?', href: SETTINGS_ROUTES.HELP },
  ];

  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Terms of Service & Privacy Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Terms of Service & Privacy" subtitle="Please read our terms carefully." />
        <Atoms.FilterList>
          <Atoms.SidebarButton icon={Libs.FileText} onClick={() => {}}>
            Terms of service
          </Atoms.SidebarButton>
          <Atoms.SidebarButton icon={Libs.LockKeyhole} onClick={() => {}}>
            Privacy policy
          </Atoms.SidebarButton>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* FAQ Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="FAQ" />
        <Atoms.FilterList>
          {faqQuestions.map((faq, index) => (
            <Link key={index} href={faq.href}>
              <div className="relative p-4 rounded-md border border-border hover:border-white cursor-pointer transition-colors">
                <span className="text-sm font-bold leading-normal text-[var(--base-popover-foreground,#EEEEF6)] pr-6 block">
                  {faq.question}
                </span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Libs.ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
          <Atoms.SidebarButton icon={Libs.HelpCircle} onClick={() => {}}>
            More FAQ
          </Atoms.SidebarButton>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Version" />
        <Atoms.FilterList className="gap-2">
          <p className="text-base font-medium leading-normal text-[var(--base-secondary-foreground,#D4D4DB)]">
            Pubky v0.12 © Synonym Software Ltd
          </p>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
