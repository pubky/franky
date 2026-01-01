// Map paths to step numbers and titles
export const pathToStepConfig: Record<string, { step: number; title: string }> = {
  '/onboarding/install': { step: 1, title: 'Identity keys' },
  '/onboarding/scan': { step: 2, title: 'Use Pubky Ring' },
  '/onboarding/pubky': { step: 2, title: 'Your pubky' },
  '/onboarding/backup': { step: 3, title: 'Backup' },
  '/onboarding/homeserver': { step: 4, title: 'Homeserver' },
  '/onboarding/profile': { step: 5, title: 'Profile' },
  '/logout': { step: 1, title: 'Signed out' },
};
