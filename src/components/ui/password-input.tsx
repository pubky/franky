'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  showStrengthMeter?: boolean;
  className?: string;
}

export function PasswordInput({
  label,
  placeholder = 'Enter password',
  value,
  onChange,
  showStrengthMeter = false,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (newValue: string) => {
    onChange(newValue);
    if (showStrengthMeter) {
      setPasswordStrength(checkPasswordStrength(newValue));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full px-3 py-2 pr-10 text-sm border rounded-md bg-background border-input placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 h-8 w-8 hover:bg-muted"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </Button>
      </div>

      {showStrengthMeter && (
        <>
          <p className="text-xs text-muted-foreground">
            Use 8+ characters with uppercase, lowercase, numbers, and symbols
          </p>

          {value && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Password strength:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-6 rounded-full ${
                      level <= passwordStrength
                        ? passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
