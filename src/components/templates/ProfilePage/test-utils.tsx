import { describe, it, expect } from 'vitest';
import { render, screen, RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Configuration for testing ProfilePage placeholder components
 */
interface ProfilePageTestConfig {
  /** The display name shown in the component */
  pageName: string;
  /** The component to test */
  Component: () => ReactElement;
  /** Whether the component has multiple lorem ipsum paragraphs (default: true for single) */
  hasMultipleParagraphs?: boolean;
}

/**
 * Factory function to generate consistent tests for ProfilePage placeholder components
 *
 * This utility eliminates test duplication by providing a standard set of tests
 * for all ProfilePage sub-components (Posts, Replies, Followers, etc.) that share
 * the same basic structure: heading + lorem ipsum content.
 *
 * @param config - Configuration object with page name and component
 *
 * @example
 * ```typescript
 * import { createProfilePageTests } from '../test-utils';
 * import { ProfilePagePosts } from './ProfilePagePosts';
 *
 * createProfilePageTests({
 *   pageName: 'Posts',
 *   Component: ProfilePagePosts,
 *   hasMultipleParagraphs: true,
 * });
 * ```
 */
export function createProfilePageTests(config: ProfilePageTestConfig): void {
  const { pageName, Component, hasMultipleParagraphs = false } = config;

  describe(`ProfilePage${pageName}`, () => {
    it('renders without errors', () => {
      render(<Component />);
      expect(screen.getByText(pageName)).toBeInTheDocument();
    });

    it('displays the correct heading', () => {
      render(<Component />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(pageName);
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
    });

    it('displays lorem ipsum text', () => {
      render(<Component />);
      const loremText = screen.queryAllByText(/Lorem ipsum dolor sit amet/);

      if (hasMultipleParagraphs) {
        expect(loremText.length).toBeGreaterThan(1);
      } else {
        expect(loremText.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('matches snapshot', () => {
      const { container } = render(<Component />);
      expect(container).toMatchSnapshot();
    });
  });
}

/**
 * Helper function to render a ProfilePage component for custom testing
 *
 * @param Component - The ProfilePage component to render
 * @returns The render result from @testing-library/react
 */
export function renderProfilePage(Component: () => ReactElement): RenderResult {
  return render(<Component />);
}
