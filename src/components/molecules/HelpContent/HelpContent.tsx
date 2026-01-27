'use client';

import { useTranslations } from 'next-intl';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { HelpCircle, FileText, MessageCircle, Send } from '@/libs';
import { SUPPORT_LINKS } from './HelpContent.constants';
import type { FAQAccordionItem } from '@/molecules/FAQAccordion';

export function HelpContent() {
  const t = useTranslations('help');

  const handleUserGuideClick = () => {
    window.open(SUPPORT_LINKS.userGuide, '_blank', 'noopener,noreferrer');
  };

  const handleSupportClick = () => {
    window.open(SUPPORT_LINKS.telegram, '_blank', 'noopener,noreferrer');
  };

  // Build FAQ sections from translations
  const faqSections = [
    {
      id: 'onboarding',
      title: t('sections.onboarding'),
      questions: [
        { id: '1', question: t('questions.q1'), answer: t('questions.a1') },
        { id: '2', question: t('questions.q2'), answer: t('questions.a2') },
        { id: '3', question: t('questions.q3'), answer: t('questions.a3') },
      ] as FAQAccordionItem[],
    },
    {
      id: 'backup',
      title: t('sections.backup'),
      questions: [
        { id: '4', question: t('questions.q4'), answer: t('questions.a4') },
        { id: '5', question: t('questions.q5'), answer: t('questions.a5') },
        { id: '6', question: t('questions.q6'), answer: t('questions.a6') },
        { id: '7', question: t('questions.q7'), answer: t('questions.a7') },
        { id: '8', question: t('questions.q8'), answer: t('questions.a8') },
        { id: '9', question: t('questions.q9'), answer: t('questions.a9') },
      ] as FAQAccordionItem[],
    },
    {
      id: 'profile',
      title: t('sections.profile'),
      questions: [
        { id: '10', question: t('questions.q10'), answer: t('questions.a10') },
        { id: '11', question: t('questions.q11'), answer: t('questions.a11') },
        { id: '12', question: t('questions.q12'), answer: t('questions.a12') },
      ] as FAQAccordionItem[],
    },
    {
      id: 'pubky',
      title: t('sections.pubky'),
      questions: [
        { id: '13', question: t('questions.q13'), answer: t('questions.a13') },
        { id: '14', question: t('questions.q14'), answer: t('questions.a14') },
      ] as FAQAccordionItem[],
    },
  ];

  return (
    <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-10">
      {/* FAQ Section */}
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-3">
          <HelpCircle size={24} />
          <Atoms.Heading level={2} size="lg" className="leading-8">
            {t('faq')}
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          {t('faqDescription')}
        </Atoms.Typography>

        <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
          {faqSections.map((section) => (
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
            {t('userGuide')}
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          {t('userGuideDescription')}
        </Atoms.Typography>
        <Atoms.Button id="user-guide-btn" variant="secondary" size="default" onClick={handleUserGuideClick}>
          <FileText size={16} />
          {t('userGuideButton')}
        </Atoms.Button>
      </Atoms.Container>

      <Molecules.SettingsDivider />

      {/* Support Section */}
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start gap-6">
        <Atoms.Container overrideDefaults className="inline-flex items-center gap-3">
          <MessageCircle size={24} />
          <Atoms.Heading level={2} size="lg" className="leading-8">
            {t('support')}
          </Atoms.Heading>
        </Atoms.Container>
        <Atoms.Typography as="p" overrideDefaults className="text-base leading-6 font-medium text-secondary-foreground">
          {t('supportDescription')}
        </Atoms.Typography>
        <Atoms.Button id="support-btn" variant="secondary" size="default" onClick={handleSupportClick}>
          <Send size={16} />
          {t('supportButton')}
        </Atoms.Button>
      </Atoms.Container>
    </Atoms.Container>
  );
}
