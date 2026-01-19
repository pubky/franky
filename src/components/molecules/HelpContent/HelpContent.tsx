'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { HelpCircle, FileText, MessageCircle, Send } from '@/libs';
import { FAQ_SECTIONS, SUPPORT_LINKS } from './HelpContent.constants';

export function HelpContent() {
  const handleUserGuideClick = () => {
    window.open(SUPPORT_LINKS.userGuide, '_blank', 'noopener,noreferrer');
  };

  const handleSupportClick = () => {
    window.open(SUPPORT_LINKS.telegram, '_blank', 'noopener,noreferrer');
  };

  return (
    <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-10">
      {/* FAQ Section */}
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-3">
          <HelpCircle size={24} />
          <Atoms.Heading level={2} size="lg" className="leading-8">
            FAQ
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          Frequently asked questions from Pubky users
        </Atoms.Typography>

        <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
          {FAQ_SECTIONS.map((section) => (
            <Atoms.Container key={section.id} overrideDefaults className="flex w-full flex-col items-start gap-6">
              <Atoms.Heading level={4} size="md" className="leading-7 font-bold">
                {section.title}
              </Atoms.Heading>
              <Molecules.FAQAccordion items={section.questions} className="w-full gap-3" />
            </Atoms.Container>
          ))}
        </Atoms.Container>
      </Atoms.Container>

      <Molecules.SettingsDivider />

      {/* User Guide Section */}
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-3">
          <FileText size={24} />
          <Atoms.Heading level={2} size="lg" className="leading-8">
            User Guide
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          The Pubky User Guide will help you navigate through the app, utilize its key features, and get the most out of
          your Pubky experience.
        </Atoms.Typography>
        <Atoms.Button id="user-guide-btn" variant="secondary" size="default" onClick={handleUserGuideClick}>
          <FileText size={16} />
          User guide
        </Atoms.Button>
      </Atoms.Container>

      <Molecules.SettingsDivider />

      {/* Support Section */}
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-3">
          <MessageCircle size={24} />
          <Atoms.Heading level={2} size="lg" className="leading-8">
            Support
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          Cannot find the answer you&apos;re looking for? Pubky support will help you out in no time.
        </Atoms.Typography>
        <Atoms.Button id="support-btn" variant="secondary" size="default" onClick={handleSupportClick}>
          <Send size={16} />
          Support (Telegram)
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
