import * as React from 'react';
import * as Atoms from '@/atoms';

export interface SettingsSectionProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ComponentType<{ size?: number }>;
  buttonId: string;
  buttonVariant?: 'secondary' | 'destructive';
  buttonDisabled?: boolean;
  buttonOnClick: () => void;
  titleClassName?: string;
  iconClassName?: string;
}

export const SettingsSection = React.memo(function SettingsSection({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonId,
  buttonVariant = 'secondary',
  buttonDisabled = false,
  buttonOnClick,
  titleClassName,
  iconClassName,
}: SettingsSectionProps) {
  return (
    <div className="flex-col justify-start items-start flex">
      <div className="justify-start items-center gap-2 inline-flex pb-6">
        <Icon size={24} className={iconClassName} />
        <Atoms.Heading level={2} size="lg" className={titleClassName}>
          {title}
        </Atoms.Heading>
      </div>
      <Atoms.Typography
        size="md"
        className="text-base-secondary-foreground text-base font-medium leading-6 pb-6 text-[#D4D4DB]"
      >
        {description}
      </Atoms.Typography>
      <Atoms.Button
        id={buttonId}
        variant={buttonVariant}
        size="default"
        disabled={buttonDisabled}
        onClick={buttonOnClick}
      >
        <ButtonIcon size={16} />
        {buttonText}
      </Atoms.Button>
    </div>
  );
});
