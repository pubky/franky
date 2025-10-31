export interface PasswordStrengthResult {
  strength: number;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
  percentage: number;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-_=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  Object.values(checks).forEach((check) => {
    if (check) strength++;
  });

  return {
    strength,
    checks,
    percentage: (strength / 5) * 100,
  };
}

export function getStrengthText(strength: number): string {
  if (strength === 0) return '';
  if (strength <= 2) return 'Weak password';
  if (strength <= 3) return 'Fair password';
  if (strength <= 4) return 'Good password';
  return 'Strong password!';
}

export function getStrengthColor(strength: number): string {
  if (strength <= 2) return 'text-red-400';
  if (strength <= 3) return 'text-yellow-400';
  if (strength <= 4) return 'text-blue-400';
  return 'text-green-400';
}
