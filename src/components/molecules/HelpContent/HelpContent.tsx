'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import { FAQ_QUESTIONS, SUPPORT_LINKS } from './HelpContent.constants';

export function HelpContent() {
  const handleUserGuideClick = React.useCallback(() => {
    window.open(SUPPORT_LINKS.userGuide, '_blank', 'noopener,noreferrer');
  }, []);

  const handleSupportClick = React.useCallback(() => {
    window.open(SUPPORT_LINKS.telegram, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <>
      {/* FAQ Section */}
      <div className="inline-flex items-center justify-start gap-2">
        <Libs.HelpCircle size={24} />
        <h2 className="text-2xl leading-8 font-bold text-foreground">FAQ</h2>
      </div>
      <p className="text-base leading-6 font-medium text-foreground">Frequently asked questions from Pubky users</p>
      <Molecules.FAQAccordion items={FAQ_QUESTIONS} />

      <Molecules.SettingsDivider className="my-6 h-px w-full bg-white/10" />

      {/* User Guide Section */}
      <div className="inline-flex items-center justify-start gap-2">
        <Libs.FileText size={24} />
        <h2 className="text-2xl leading-8 font-bold text-foreground">User Guide</h2>
      </div>
      <p className="text-base leading-6 font-medium text-foreground">
        The Pubky User Guide will help you navigate through the app, utilize its key features, and get the most out of
        your Pubky experience.
      </p>
      <Atoms.Button id="user-guide-btn" variant="secondary" size="default" onClick={handleUserGuideClick}>
        <Libs.FileText size={16} />
        User Guide
      </Atoms.Button>

      <Molecules.SettingsDivider className="my-6 h-px w-full bg-white/10" />

      {/* Support Section */}
      <div className="inline-flex items-center justify-start gap-2">
        <Libs.MessageCircle size={24} />
        <h2 className="text-2xl leading-8 font-bold text-foreground">Support</h2>
      </div>
      <p className="text-base leading-6 font-medium text-foreground">
        Cannot find the answer you&apos;re looking for? Pubky support will help you out in no time.
      </p>
      <Atoms.Button id="support-btn" variant="secondary" size="default" onClick={handleSupportClick}>
        <Libs.MessageCircle size={16} />
        Support (Telegram)
      </Atoms.Button>
    </>
  );
}
