import { SettingsMenu } from './SettingsMenu';
import { SettingsInfo } from './SettingsInfo';

export function SettingsLeftSidebar() {
  return (
    <div className="self-start sticky top-[100px]">
      <SettingsMenu />
    </div>
  );
}

export function SettingsRightSidebar() {
  return (
    <div className="self-start sticky top-[100px]">
      <SettingsInfo />
    </div>
  );
}

export function SettingsLeftDrawer() {
  return <SettingsMenu />;
}

export function SettingsRightDrawer() {
  return <SettingsInfo />;
}
