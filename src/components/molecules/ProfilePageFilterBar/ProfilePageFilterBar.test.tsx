import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFilterBar, getDefaultItems } from './ProfilePageFilterBar';
import { PROFILE_PAGE_TYPES } from '@/app/profile/types';
import * as Hooks from '@/hooks';

const mockStats: Hooks.ProfileStats = {
  notifications: 2,
  posts: 4,
  replies: 7,
  followers: 115,
  following: 27,
  friends: 10,
  tagged: 5,
};

describe('ProfilePageFilterBar', () => {
  it('renders all filter items with stats', () => {
    render(
      <ProfilePageFilterBar
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
        stats={mockStats}
      />,
    );
    const defaultItems = getDefaultItems(mockStats);
    defaultItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.count.toString())).toBeInTheDocument();
    });
  });

  it('has correct structure with sticky positioning', () => {
    const { container } = render(
      <ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass(
      'sticky',
      'top-[var(--header-height)]',
      'hidden',
      'h-fit',
      'w-[180px]',
      'flex-col',
      'self-start',
      'lg:flex',
    );
  });

  it('renders correct number of filter items', () => {
    const { container } = render(
      <ProfilePageFilterBar
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
        stats={mockStats}
      />,
    );
    const filterItems = container.querySelectorAll('[data-slot="filter-item"]');
    expect(filterItems.length).toBe(getDefaultItems(mockStats).length);
  });

  it('renders with zero counts when no stats provided', () => {
    render(<ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    // Should show 0 for all counts when no stats provided
    const counts = screen.getAllByText('0');
    expect(counts.length).toBeGreaterThan(0);
  });

  it('marks active item correctly', () => {
    render(<ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
    const activeItem = screen.getByText('Notifications').closest('[data-slot="filter-item"]');
    expect(activeItem).toHaveAttribute('data-selected', 'true');

    const inactiveItem = screen.getByText('Posts').closest('[data-slot="filter-item"]');
    expect(inactiveItem).toHaveAttribute('data-selected', 'false');
  });

  it('applies correct count styling for active and inactive items', () => {
    render(
      <ProfilePageFilterBar
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
        stats={mockStats}
      />,
    );
    const activeCount = screen.getByText('2').closest('span');
    expect(activeCount).toHaveClass('text-foreground');

    const inactiveCount = screen.getByText('4').closest('span');
    expect(inactiveCount).toHaveClass('text-muted-foreground');
  });

  it('renders with custom items', () => {
    const customItems = [
      { icon: () => <span>Icon</span>, label: 'Custom', count: 10, pageType: PROFILE_PAGE_TYPES.NOTIFICATIONS },
    ];
    render(
      <ProfilePageFilterBar
        items={customItems}
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
      />,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

describe('ProfilePageFilterBar - Snapshots', () => {
  it('matches snapshot with stats', () => {
    const { container } = render(
      <ProfilePageFilterBar
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
        stats={mockStats}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without stats (zero counts)', () => {
    const { container } = render(
      <ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom items', () => {
    const customItems = [
      { icon: () => <span>Icon</span>, label: 'Custom', count: 10, pageType: PROFILE_PAGE_TYPES.NOTIFICATIONS },
    ];
    const { container } = render(
      <ProfilePageFilterBar
        items={customItems}
        activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS}
        onPageChangeAction={() => {}}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
