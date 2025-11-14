import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFilterBar } from './ProfilePageFilterBar';
import { DEFAULT_ITEMS } from './ProfilePageFilterBar';
import { PROFILE_PAGE_TYPES } from '@/app/profile/types';

describe('ProfilePageFilterBar', () => {
  it('renders all filter items', () => {
    render(<ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
    DEFAULT_ITEMS.forEach((item) => {
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
      'top-[314px]',
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
      <ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />,
    );
    const filterItems = container.querySelectorAll('[data-slot="filter-item"]');
    expect(filterItems.length).toBe(DEFAULT_ITEMS.length);
  });

  it('marks active item correctly', () => {
    render(<ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
    const activeItem = screen.getByText('Notifications').closest('[data-slot="filter-item"]');
    expect(activeItem).toHaveAttribute('data-selected', 'true');

    const inactiveItem = screen.getByText('Posts').closest('[data-slot="filter-item"]');
    expect(inactiveItem).toHaveAttribute('data-selected', 'false');
  });

  it('applies correct count styling for active and inactive items', () => {
    render(<ProfilePageFilterBar activePage={PROFILE_PAGE_TYPES.NOTIFICATIONS} onPageChangeAction={() => {}} />);
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
  it('matches snapshot with default props', () => {
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
