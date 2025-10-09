import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastProvider, ToastViewport } from './Toast';

// Mock @/libs - use actual implementations and only stub cn helper
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
  };
});

describe('Toast Components', () => {
  it('should handle Toast component imports without errors', () => {
    // This test ensures all components can be imported and used
    expect(Toast).toBeDefined();
    expect(ToastProvider).toBeDefined();
    expect(ToastViewport).toBeDefined();
  });
});

describe('Toast - Snapshots', () => {
  it('matches snapshot for ToastProvider', () => {
    const { container } = render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ToastViewport', () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
