'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface SettingsInfoProps {
  className?: string;
}

export function SettingsInfo({ className }: SettingsInfoProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-6', className)}>
      {/* Terms of Service & Privacy Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Terms of Service & Privacy" subtitle="Read our terms carefully." />
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
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.MessageCircle} />
            <Atoms.FilterItemLabel>How can I delete my post?</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.UserX} />
            <Atoms.FilterItemLabel>How do I mute someone?</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.RotateCcw} />
            <Atoms.FilterItemLabel>How do I restore my account?</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.HelpCircle} />
            <Atoms.FilterItemLabel>How is Pubky different from other social platforms</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.MessageCircle} />
            <Atoms.FilterItemLabel>More FAQ</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
        </Atoms.FilterList>
      </Atoms.FilterRoot>

      {/* Version Section */}
      <Atoms.FilterRoot>
        <Atoms.FilterHeader title="Version" />
        <Atoms.FilterList>
          <div className="px-3 py-2">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              Pubky version v0.12 © Synonym Software Ltd
            </Atoms.Typography>
          </div>
        </Atoms.FilterList>
      </Atoms.FilterRoot>
    </div>
  );
}
