import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastProvider, ToastViewport } from './Toast';

// Mock @/libs to intercept Libs.X
vi.mock('@/libs', () => ({
  X: () => <svg data-testid="x-icon" />,
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
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

  // TODO: address null output
  // it('matches snapshot for Toast with default props', () => {
  //   const { container } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <div>Toast content</div>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(container.firstChild).toMatchSnapshot();
  // });

  // TODO: address null output
  // it('matches snapshots for Toast with different configurations', () => {
  //   const { container: defaultContainer } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <div>Default toast</div>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(defaultContainer.firstChild).toMatchSnapshot();

  //   const { container: customClassContainer } = render(
  //     <ToastProvider>
  //       <Toast className="custom-toast">
  //         <div>Custom toast</div>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(customClassContainer.firstChild).toMatchSnapshot();
  // });

  // TODO: address null output
  // it('matches snapshots for Toast subcomponents', () => {
  //   const { container: titleContainer } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <ToastTitle>Toast Title</ToastTitle>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(titleContainer.firstChild).toMatchSnapshot();

  //   const { container: descriptionContainer } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <ToastDescription>Toast Description</ToastDescription>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(descriptionContainer.firstChild).toMatchSnapshot();

  //   const { container: actionContainer } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <ToastAction>Action</ToastAction>
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(actionContainer.firstChild).toMatchSnapshot();

  //   const { container: closeContainer } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <ToastClose />
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(closeContainer.firstChild).toMatchSnapshot();
  // });

  // TODO: address null output
  // it('matches snapshot for complete toast structure', () => {
  //   const { container } = render(
  //     <ToastProvider>
  //       <Toast>
  //         <ToastTitle>Complete Toast</ToastTitle>
  //         <ToastDescription>This is a complete toast with all components</ToastDescription>
  //         <ToastAction>Action</ToastAction>
  //         <ToastClose />
  //       </Toast>
  //     </ToastProvider>,
  //   );
  //   expect(container.firstChild).toMatchSnapshot();
  // });
});
