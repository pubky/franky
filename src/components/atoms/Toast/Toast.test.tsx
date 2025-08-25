import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastProvider, ToastViewport } from './Toast';

// Mock icons from @/libs/icons
vi.mock('@/libs/icons', () => ({
  X: () => <svg data-testid="x-icon" />,
}));

describe('Toast Components', () => {
  describe('ToastProvider', () => {
    it('should render children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="toast-content">Test content</div>
        </ToastProvider>,
      );

      expect(screen.getByTestId('toast-content')).toBeInTheDocument();
    });
  });

  describe('ToastViewport', () => {
    it('should render ToastViewport component', () => {
      const { container } = render(
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>,
      );

      // ToastViewport should be present in the DOM
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Toast Integration', () => {
    it('should render ToastProvider with viewport', () => {
      const { container } = render(
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>,
      );

      expect(container.firstChild).toBeTruthy();
    });

    it('should handle Toast component imports without errors', () => {
      // This test ensures all components can be imported and used
      expect(Toast).toBeDefined();
      expect(ToastProvider).toBeDefined();
      expect(ToastViewport).toBeDefined();
    });
  });
});
