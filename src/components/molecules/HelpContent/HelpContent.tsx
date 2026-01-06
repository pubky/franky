'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { HelpCircle, FileText, MessageCircle } from '@/libs';
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
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-2">
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
      <Molecules.SettingsSection
        icon={FileText}
        title="User Guide"
        description="The Pubky User Guide will help you navigate through the app, utilize its key features, and get the most out of your Pubky experience."
        buttonText="User guide"
        buttonIcon={FileText}
        buttonId="user-guide-btn"
        buttonOnClick={handleUserGuideClick}
      />

      <Molecules.SettingsDivider />

      {/* Support Section */}
      <Molecules.SettingsSection
        icon={MessageCircle}
        title="Support"
        description="Cannot find the answer you're looking for? Pubky support will help you out in no time."
        buttonText="Support (Telegram)"
        buttonIcon={MessageCircle}
        buttonId="support-btn"
        buttonOnClick={handleSupportClick}
      />
    </Atoms.Container>
  );
}
