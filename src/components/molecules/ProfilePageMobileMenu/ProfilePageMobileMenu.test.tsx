import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageMobileMenu, PROFILE_MENU_ITEMS } from './ProfilePageMobileMenu';
import { PROFILE_PAGE_TYPES } from '@/app/profile/types';

describe('ProfilePageMobileMenu', () => {
  it('renders all menu items', () => {
    render(<ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
    PROFILE_MENU_ITEMS.forEach((item) => {
      expect(screen.getByLabelText(item.label)).toBeInTheDocument();
    });
  });

  it('has correct structure with sticky positioning', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('sticky', 'top-20', 'z-30', 'bg-background', 'lg:hidden');
  });

  it('renders correct number of menu items', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(PROFILE_MENU_ITEMS.length);
  });

  it('marks the active item with aria-current="page"', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.FOLLOWING} onPageChangeAction={() => {}} />,
    );
    const activeButton = container.querySelector('button[aria-current="page"]');
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveAttribute('aria-label', 'Following');
  });

  it('applies correct border classes to active and inactive items', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.FOLLOWING} onPageChangeAction={() => {}} />,
    );
    const items = container.querySelectorAll('div[class*="border-b"]');

    // Active item (Following) should have border-foreground
    const followingIndex = PROFILE_MENU_ITEMS.findIndex((item) => item.pageType === PROFILE_PAGE_TYPES.FOLLOWING);
    const activeItem = items[followingIndex];
    expect(activeItem).toHaveClass('border-foreground');

    // Inactive items should have border-border
    items.forEach((item, index) => {
      if (index !== followingIndex) {
        expect(item).toHaveClass('border-border');
      }
    });
  });

  it('applies correct text color classes to icons', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.FOLLOWING} onPageChangeAction={() => {}} />,
    );
    const icons = container.querySelectorAll('svg');

    // Active icon (Following) should have text-foreground
    const followingIndex = PROFILE_MENU_ITEMS.findIndex((item) => item.pageType === PROFILE_PAGE_TYPES.FOLLOWING);
    const activeIcon = icons[followingIndex];
    expect(activeIcon).toHaveClass('text-foreground');

    // Inactive icons should have text-muted-foreground
    icons.forEach((icon, index) => {
      if (index !== followingIndex) {
        expect(icon).toHaveClass('text-muted-foreground');
      }
    });
  });

  it('has correct button structure with padding', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      expect(button).toHaveClass('px-2.5', 'py-2');
    });
  });

  it('has correct container structure with flex and border', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const items = container.querySelectorAll('div[class*="border-b"]');
    items.forEach((item) => {
      expect(item).toHaveClass('flex', 'flex-1', 'justify-center', 'border-b', 'px-0', 'py-1.5');
    });
  });
});

describe('ProfilePageMobileMenu - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(
      <ProfilePageMobileMenu activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
