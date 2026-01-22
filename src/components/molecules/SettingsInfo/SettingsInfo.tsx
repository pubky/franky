'use client';

import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import * as App from '@/app';

export interface SettingsInfoProps {
  className?: string;
  hideFAQ?: boolean;
}

const FAQ_QUESTIONS = [
  { id: 'delete-post', question: 'How can I delete my post?', href: App.SETTINGS_ROUTES.HELP },
  { id: 'mute-someone', question: 'How do I mute someone?', href: App.SETTINGS_ROUTES.HELP },
  { id: 'restore-account', question: 'How do I restore my account?', href: App.SETTINGS_ROUTES.HELP },
  {
    id: 'pubky-difference',
    question: 'How is Pubky different from other social platforms',
    href: App.SETTINGS_ROUTES.HELP,
  },
];

const VERSION_INFO = {
  pubky: 'v0.12',
  homeserver: 'v0.15',
  nexus: 'v0.17',
  copyright: '© 2025 Synonym Software, S.A. DE C.V.',
};

export function SettingsInfo({ className, hideFAQ = false }: SettingsInfoProps) {
  return (
    <Atoms.Container overrideDefaults className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Terms of Service & Privacy Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Terms of Service & Privacy" subtitle="Read our terms carefully." />
        <Atoms.FilterList className="gap-2">
          <Organisms.DialogTerms
            trigger={<Atoms.SidebarButton icon={Libs.FileText}>Terms of service</Atoms.SidebarButton>}
          />
          <Organisms.DialogPrivacy
            trigger={<Atoms.SidebarButton icon={Libs.LockKeyhole}>Privacy policy</Atoms.SidebarButton>}
          />
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* FAQ Section - Hidden when on FAQ page */}
      {!hideFAQ && (
        <Atoms.FilterRoot>
          <Atoms.FilterHeader title="FAQ" />
          <Atoms.FilterList className="gap-2">
            {FAQ_QUESTIONS.map((faq) => (
              <Link key={faq.id} href={faq.href}>
                <Atoms.Container
                  overrideDefaults
                  className="relative cursor-pointer rounded-md border border-border p-4 transition-colors hover:border-white"
                >
                  <Atoms.Typography
                    as="span"
                    size="sm"
                    overrideDefaults
                    className="block pr-6 leading-normal font-bold text-popover-foreground"
                  >
                    {faq.question}
                  </Atoms.Typography>
                  <Atoms.Container overrideDefaults className="absolute top-1/2 right-3 -translate-y-1/2">
                    <Libs.ChevronRight size={16} />
                  </Atoms.Container>
                </Atoms.Container>
              </Link>
            ))}
            <Link href={App.SETTINGS_ROUTES.HELP}>
              <Atoms.SidebarButton icon={Libs.MessageCircleQuestion}>More FAQ</Atoms.SidebarButton>
            </Link>
          </Atoms.FilterList>
        </Atoms.FilterRoot>
      )}

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Version" />
        <Atoms.FilterList>
          <Atoms.Container overrideDefaults className="flex flex-col">
            <Atoms.Typography
              as="p"
              size="md"
              overrideDefaults
              className="leading-normal font-medium text-secondary-foreground"
            >
              Pubky{' '}
              <Atoms.Typography as="span" className="text-muted-foreground">
                {VERSION_INFO.pubky}
              </Atoms.Typography>
            </Atoms.Typography>
            <Atoms.Typography
              as="p"
              size="md"
              overrideDefaults
              className="leading-normal font-medium text-secondary-foreground"
            >
              Homeserver{' '}
              <Atoms.Typography as="span" className="text-muted-foreground">
                {VERSION_INFO.homeserver}
              </Atoms.Typography>
            </Atoms.Typography>
            <Atoms.Typography
              as="p"
              size="md"
              overrideDefaults
              className="leading-normal font-medium text-secondary-foreground"
            >
              Nexus{' '}
              <Atoms.Typography as="span" className="text-muted-foreground">
                {VERSION_INFO.nexus}
              </Atoms.Typography>
            </Atoms.Typography>
            <Atoms.Typography
              as="p"
              size="md"
              overrideDefaults
              className="mt-4 leading-normal font-medium text-secondary-foreground"
            >
              {VERSION_INFO.copyright}
            </Atoms.Typography>
          </Atoms.Container>
          {/* Synonym Logo with Tether tagline */}
          <Atoms.Container overrideDefaults className="flex flex-col items-start pt-4">
            <Atoms.Container overrideDefaults className="flex items-center gap-1">
              <Libs.Synonym size={24} />
              <Atoms.Typography as="span" size="sm" overrideDefaults className="font-medium text-foreground">
                Synonym
              </Atoms.Typography>
            </Atoms.Container>
            <Atoms.Typography as="span" size="xs" overrideDefaults className="text-muted-foreground">
              a <span className="font-semibold">tether.</span> company
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </Atoms.Container>
  );
}
