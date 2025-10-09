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
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.FileText} />
            <Atoms.FilterItemLabel>Terms of service</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.Lock} />
            <Atoms.FilterItemLabel>Privacy policy</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* FAQ Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="FAQ" />
        <Atoms.FilterList>
          {faqQuestions.map((faq, index) => (
            <Link key={index} href={faq.href}>
              <div className="relative px-3 py-3 border border-border rounded-lg hover:border-opacity-30 cursor-pointer">
                <span className="text-sm font-semibold leading-tight pr-6 block">{faq.question}</span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Libs.ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
          <Link href={SETTINGS_ROUTES.HELP}>
            <Atoms.Button variant="secondary" size="sm" className="w-full">
              <Libs.HelpCircle size={16} />
              More FAQ
            </Atoms.Button>
          </Link>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Version" />
        <Atoms.FilterList>
          <div className="px-3 py-2">
            <p className="text-sm text-muted-foreground leading-snug">Pubky v0.12 © Synonym Software Ltd</p>
          </div>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
