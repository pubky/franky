import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DialogConfirmBackup } from './DialogConfirmBackup';

// Mock Core module
vi.mock('@/core', () => ({
  useOnboardingStore: vi.fn(() => ({
    clearSecrets: vi.fn(),
  })),
}));

// Mock atoms - use actual implementations
vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
  };
});

// Mock libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogBackup: vi.fn(() => <div data-testid="dialog-backup">DialogBackup</div>),
}));

describe('DialogConfirmBackup - Snapshot', () => {
  it('matches snapshot for default DialogConfirmBackup', () => {
    const { container } = render(<DialogConfirmBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
