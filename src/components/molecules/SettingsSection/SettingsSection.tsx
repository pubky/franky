import * as React from 'react';
import * as Atoms from '@/atoms';
import type { SettingsSectionProps } from './SettingsSection.types';

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
    <Atoms.Container overrideDefaults className="flex flex-col items-start justify-start">
      <Atoms.Container overrideDefaults className="inline-flex items-center justify-start gap-2 pb-6">
        <Icon size={24} className={iconClassName} />
        <Atoms.Heading level={2} size="lg" className={titleClassName}>
          {title}
        </Atoms.Heading>
      </Atoms.Container>
      <Atoms.Typography
        as="p"
        size="md"
        overrideDefaults
        className="pb-6 text-base leading-6 font-medium text-secondary-foreground"
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
    </Atoms.Container>
  );
});
