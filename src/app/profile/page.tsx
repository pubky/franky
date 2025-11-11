import { redirect } from 'next/navigation';
import { PROFILE_ROUTES } from '@/app/routes';

export default function ProfilePage() {
  redirect(PROFILE_ROUTES.NOTIFICATIONS);
}
