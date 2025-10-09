import { redirect } from 'next/navigation';
import { SETTINGS_ROUTES } from '@/app';

export default function SettingsPage() {
  redirect(SETTINGS_ROUTES.ACCOUNT);
}
